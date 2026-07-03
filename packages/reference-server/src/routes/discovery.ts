import { Hono } from "hono";

const BASE = process.env.SCP_BASE_URL ?? "http://localhost:8787";

export const discoveryRouter = new Hono();

discoveryRouter.get("/", (c) =>
  c.json({
    protocol_version: "1.0",
    merchant_name: "Acme Outdoor Co.",
    token_endpoint: `${BASE}/v1/oauth/token`,
    context_endpoint: `${BASE}/v1/context`,
    supported_scopes: ["order_history", "loyalty", "preferences", "payment_methods"],
    scp_spec_version: "2024-11",
    description:
      "Acme Outdoor Co. reference SCP implementation. For development and testing only.",
  }),
);
