import type { Context } from "hono";

// Demo-only: auto-approves all valid grant types without real PKCE or magic-link verification.
// In production, this would validate the auth code, PKCE verifier, and client credentials.
export async function tokenHandler(c: Context) {
  const contentType = c.req.header("Content-Type") ?? "";

  let grantType: string;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await c.req.parseBody();
    grantType = String(body.grant_type ?? "");
  } else {
    const body = await c.req.json<{ grant_type?: string }>();
    grantType = body.grant_type ?? "";
  }

  if (!["authorization_code", "refresh_token", "client_credentials"].includes(grantType)) {
    return c.json(
      {
        error: "unsupported_grant_type",
        error_description:
          "Supported grant types: authorization_code, refresh_token. (client_credentials accepted for demo compatibility.)",
      },
      400,
    );
  }

  // Auto-approve — reference server only
  const token = `scp_demo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return c.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 3600,
    scope: "orders loyalty offers preferences",
  });
}
