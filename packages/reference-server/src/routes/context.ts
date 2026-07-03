import { Hono } from "hono";
import { bearerAuth } from "../middleware/auth";
import { FAKE_SHOPPERS, SHOPPER_MAP } from "../data/shoppers";

const VALID_SCOPES = ["order_history", "loyalty", "preferences", "payment_methods"] as const;
type Scope = (typeof VALID_SCOPES)[number];

export const contextRouter = new Hono();
contextRouter.use("/*", bearerAuth);

/** GET /v1/context/:shopper_id?scopes=order_history,loyalty */
contextRouter.get("/:shopper_id", (c) => {
  const shopperId = c.req.param("shopper_id");

  if (shopperId === "random") {
    const randomShopper = FAKE_SHOPPERS[Math.floor(Math.random() * FAKE_SHOPPERS.length)];
    return c.redirect(`/v1/context/${randomShopper!.id}?${c.req.raw.url.split("?")[1] ?? ""}`);
  }

  const scopeParam = c.req.query("scopes") ?? "";
  const requestedScopes = scopeParam
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Scope => (VALID_SCOPES as readonly string[]).includes(s));

  const shopper = SHOPPER_MAP.get(shopperId);
  if (!shopper) {
    return c.json(
      {
        error: "shopper_not_found",
        shopper_id: shopperId,
        message: `No shopper found with id '${shopperId}'. Valid ids: ${[...SHOPPER_MAP.keys()].join(", ")}`,
      },
      404,
    );
  }

  const context: Record<string, unknown> = {};
  const scopesReturned: string[] = [];

  for (const scope of requestedScopes) {
    switch (scope) {
      case "order_history":
        context.order_history = shopper.orderHistory;
        scopesReturned.push(scope);
        break;
      case "loyalty":
        context.loyalty = shopper.loyalty;
        scopesReturned.push(scope);
        break;
      case "preferences":
        context.preferences = shopper.preferences;
        scopesReturned.push(scope);
        break;
      case "payment_methods":
        context.payment_methods = shopper.paymentMethods;
        scopesReturned.push(scope);
        break;
    }
  }

  return c.json({
    shopper_id: shopperId,
    display_name: shopper.displayName,
    scopes_returned: scopesReturned,
    context,
  });
});

/** GET /v1/context — list all shopper IDs (convenience for testing) */
contextRouter.get("/", bearerAuth, (c) => {
  return c.json({
    shoppers: FAKE_SHOPPERS.map((s) => ({ id: s.id, display_name: s.displayName })),
  });
});
