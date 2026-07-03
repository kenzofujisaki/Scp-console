import { Hono } from "hono";

export const oauthRouter = new Hono();

oauthRouter.post("/token", async (c) => {
  const body = await c.req.json<{
    grant_type: string;
    client_id?: string;
    client_secret?: string;
  }>();

  if (body.grant_type !== "client_credentials") {
    return c.json(
      {
        error: "unsupported_grant_type",
        message: "Only client_credentials is supported by this reference implementation.",
      },
      400,
    );
  }

  // Auto-approve all credentials — this is a reference/demo server only
  const token = `scp_demo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return c.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 3600,
    scope: "order_history loyalty preferences payment_methods",
  });
});
