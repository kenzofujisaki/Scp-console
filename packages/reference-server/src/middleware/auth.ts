import type { Context, Next } from "hono";

export async function bearerAuth(c: Context, next: Next) {
  const auth = c.req.header("Authorization") ?? "";
  if (!auth.startsWith("Bearer scp_demo_")) {
    return c.json(
      {
        error: "invalid_token",
        message:
          "Missing or invalid Bearer token. Obtain one via POST /v1/token with grant_type=authorization_code.",
      },
      401,
    );
  }
  await next();
}
