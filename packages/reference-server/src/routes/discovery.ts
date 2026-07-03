import type { Context } from "hono";

const BASE = process.env.SCP_BASE_URL ?? "http://localhost:8787";

export function wellKnownHandler(c: Context) {
  return c.json({
    version: "scp1",
    endpoint: `${BASE}/v1`,
  });
}

export function capabilitiesHandler(c: Context) {
  return c.json({
    version: "1.0",
    protocol_version: "scp1",
    scopes_supported: ["orders", "loyalty", "offers", "preferences"],
    authorization_endpoint: `${BASE}/v1/authorize/init`,
    token_endpoint: `${BASE}/v1/token`,
    revocation_endpoint: `${BASE}/v1/revoke`,
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    magic_link_supported: false,
    webhook_support: false,
    rate_limit: { requests_per_minute: 100, requests_per_hour: 1000 },
  });
}
