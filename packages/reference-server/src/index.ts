import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { contextRouter } from "./routes/context";
import { discoveryRouter } from "./routes/discovery";
import { oauthRouter } from "./routes/oauth";

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

app.route("/.well-known/scp-configuration", discoveryRouter);
app.route("/v1/oauth", oauthRouter);
app.route("/v1/context", contextRouter);

app.get("/health", (c) =>
  c.json({
    status: "ok",
    server: "Acme Outdoor Co. SCP Reference Server",
    protocol_version: "1.0",
  }),
);

app.notFound((c) =>
  c.json(
    { error: "not_found", message: `Route ${c.req.method} ${c.req.path} not found` },
    404,
  ),
);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.warn(
    `[scp] Acme Outdoor Co. reference server → http://localhost:${PORT}`,
  );
});
