import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { wellKnownHandler, capabilitiesHandler } from "./routes/discovery";
import { tokenHandler } from "./routes/token";
import { rpcHandler } from "./routes/rpc";
import { FAKE_SHOPPERS } from "./data/shoppers";
import { PRODUCTS } from "./data/products";

const app = new Hono();
const PORT = 8787;

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Discovery
app.get("/.well-known/shopper-context-protocol", wellKnownHandler);

// Capabilities
app.get("/v1/capabilities", capabilitiesHandler);

// Token endpoint (demo auto-approve)
app.post("/v1/token", tokenHandler);

// JSON-RPC 2.0 data endpoint
app.post("/v1/rpc", rpcHandler);

// Convenience: list all shopper IDs for testing
app.get("/v1/shoppers", (c) =>
  c.json({
    shoppers: FAKE_SHOPPERS.map((s) => ({ id: s.id, display_name: s.displayName })),
  }),
);

// The brand's public product catalog. Used by the storefront to render a
// generic (cold-arrival) grid when no shopper intent is present.
app.get("/v1/products", (c) => c.json({ products: PRODUCTS }));

app.get("/health", (c) =>
  c.json({
    status: "ok",
    server: "Acme Outdoor Co. SCP Reference Server",
    protocol_version: "scp1",
  }),
);

app.notFound((c) =>
  c.json(
    { error: "not_found", message: `Route ${c.req.method} ${c.req.path} not found` },
    404,
  ),
);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.warn(`[scp] Acme Outdoor Co. reference server → http://localhost:${PORT}`);
});
