import type { Context } from "hono";
import { SCP_ERROR, type SCPIntentInput } from "@scp/protocol";
import { SHOPPER_MAP } from "../data/shoppers";
import { getIntent, putIntent } from "../data/intents";
import { matchProducts } from "../data/products";

interface RPCRequest {
  jsonrpc: "2.0";
  id: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

function rpcError(id: number | string | null, code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

function rpcResult(id: number | string | null, result: Record<string, unknown>) {
  return { jsonrpc: "2.0" as const, id, result };
}

// Boundary validation for the untrusted intent payload on scp.put_intent.
function isIntentInput(value: unknown): value is SCPIntentInput {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.category === "string" &&
    typeof v.summary === "string" &&
    Array.isArray(v.attributes) &&
    v.attributes.every(
      (a) =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as Record<string, unknown>).name === "string" &&
        typeof (a as Record<string, unknown>).value === "string",
    )
  );
}

// Demo-only: shopper_id passed in params since there's no JWT sub claim in demo tokens.
export async function rpcHandler(c: Context) {
  const auth = c.req.header("Authorization") ?? "";
  if (!auth.startsWith("Bearer scp_demo_")) {
    return c.json(
      rpcError(null, SCP_ERROR.UNAUTHORIZED, "Unauthorized — obtain a token via POST /v1/token"),
      401,
    );
  }

  let req: RPCRequest;
  try {
    req = await c.req.json<RPCRequest>();
  } catch {
    return c.json(rpcError(null, SCP_ERROR.PARSE, "Parse error"), 400);
  }

  if (req.jsonrpc !== "2.0" || !req.method) {
    return c.json(rpcError(req.id ?? null, SCP_ERROR.INVALID_REQUEST, "Invalid request"), 400);
  }

  const shopperId = req.params?.shopper_id;
  if (typeof shopperId !== "string") {
    return c.json(
      rpcError(
        req.id,
        SCP_ERROR.INVALID_PARAMS,
        "Invalid params — shopper_id (string) required in params",
      ),
      400,
    );
  }

  const shopper = SHOPPER_MAP.get(shopperId);
  if (!shopper) {
    return c.json(
      rpcError(
        req.id,
        SCP_ERROR.SHOPPER_NOT_FOUND,
        `Shopper not found: '${shopperId}'. Valid ids: ${[...SHOPPER_MAP.keys()].join(", ")}`,
      ),
      404,
    );
  }

  switch (req.method) {
    case "scp.get_orders":
      return c.json(rpcResult(req.id, { orders: shopper.orders }));

    case "scp.get_loyalty":
      return c.json(rpcResult(req.id, { loyalty: shopper.loyalty }));

    case "scp.get_offers":
      return c.json(rpcResult(req.id, { offers: shopper.offers }));

    case "scp.get_preferences":
      return c.json(rpcResult(req.id, { preferences: shopper.preferences }));

    // --- Intent channel (bidirectional) ---

    case "scp.put_intent": {
      const intent = req.params?.intent;
      if (!isIntentInput(intent)) {
        return c.json(
          rpcError(
            req.id,
            SCP_ERROR.INVALID_PARAMS,
            "Invalid params — intent { category, summary, attributes[] } required",
          ),
          400,
        );
      }
      const stored = putIntent(shopperId, intent);
      return c.json(rpcResult(req.id, { intent: stored }));
    }

    case "scp.get_intent":
      return c.json(rpcResult(req.id, { intent: getIntent(shopperId) }));

    // Brand-side convenience: read the carried intent and merchandise the
    // catalog against it in one call — what the storefront needs to render a
    // warm landing. Returns an empty match set (not the whole catalog) when
    // there is no intent, so the caller can distinguish warm vs cold arrival.
    case "scp.match_products": {
      const intent = getIntent(shopperId);
      return c.json(
        rpcResult(req.id, {
          intent,
          products: intent ? matchProducts(intent) : [],
        }),
      );
    }

    default:
      return c.json(
        rpcError(req.id, SCP_ERROR.METHOD_NOT_FOUND, `Method not found: ${req.method}`),
        404,
      );
  }
}
