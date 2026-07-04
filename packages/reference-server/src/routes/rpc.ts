import type { Context } from "hono";
import { SCP_ERROR } from "@scp/protocol";
import { SHOPPER_MAP } from "../data/shoppers";

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

    default:
      return c.json(
        rpcError(req.id, SCP_ERROR.METHOD_NOT_FOUND, `Method not found: ${req.method}`),
        404,
      );
  }
}
