# SCP Protocol — Canonical Reference

> Researched 2026-07-03 from github.com/shopper-context-protocol (RFC v1.0 draft, 2025-09-29)
> and shoppercontextprotocol.io. Do NOT implement against this file's memory — treat this
> document as the source of truth for every session.

---

## Overview

The Shopper Context Protocol (SCP) lets AI applications securely access shopper-specific context from merchants. Transport: HTTPS, TLS 1.3+. All payloads: `Content-Type: application/json`. Auth: `Authorization: Bearer {access_token}`.

---

## Discovery

DNS-first, three-step fallback:

1. **DNS TXT**: `_scp._tcp.{domain}` → value starts with `v=scp1`, extract `endpoint=https://...`
2. **HTTP fallback**: `GET https://{domain}/.well-known/shopper-context-protocol`
   ```json
   { "version": "scp1", "endpoint": "https://scp-api.merchant.com/v1" }
   ```
   *(Note: the MCP wrapper implementation uses `/.well-known/customer-context-protocol` — ambiguity exists in the spec)*
3. **Header fallback**: `SCP-Endpoint` response header on `GET https://{domain}/`
4. **Env override**: `SCP_TEST_ENDPOINT`

After the endpoint is found, fetch capabilities:

---

## Endpoints

All rooted at the discovered SCP base URL (e.g. `https://scp-api.merchant.com/v1`):

| Method | Path | Description |
|---|---|---|
| GET | `/v1/capabilities` | Server capability declaration |
| POST | `/v1/authorize/init` | Initiate magic-link OAuth flow |
| GET | `/v1/authorize/poll` | Poll authorization status |
| GET | `/v1/authorize/confirm` | Magic link landing page |
| POST | `/v1/token` | Exchange auth code or refresh token |
| POST | `/v1/revoke` | Revoke access or refresh token |
| **POST** | **`/v1/rpc`** | **JSON-RPC 2.0 — ALL data methods** |

### `/v1/capabilities` response

```json
{
  "version": "1.0",
  "protocol_version": "scp1",
  "scopes_supported": ["orders", "loyalty", "offers", "preferences"],
  "authorization_endpoint": "https://scp-api.merchant.com/v1/authorize/init",
  "token_endpoint": "https://scp-api.merchant.com/v1/token",
  "revocation_endpoint": "https://scp-api.merchant.com/v1/revoke",
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"],
  "magic_link_supported": true,
  "webhook_support": false,
  "rate_limit": { "requests_per_minute": 100, "requests_per_hour": 1000 }
}
```

---

## Scope Names (v1.0 standard)

| Scope | Access | What it returns |
|---|---|---|
| `orders` | read | Order history, items, tracking, status, addresses, totals |
| `orders:write` | write | Returns and cancellations |
| `loyalty` | read | Program name, member ID, tier, points (current/lifetime/expiring), benefits |
| `loyalty:redeem` | write | Point and reward redemption |
| `offers` | read | Personalized offers: type, title, code, discount, validity, min_purchase |
| `preferences` | read+write | Sizes, favorite brands, style preferences, saved addresses, communication settings |
| `subscriptions` | read+write | Active subscriptions and plans |
| `wishlist` | read+write | Saved items and wishlists |
| `reviews` | read+write | Shopper product reviews |
| `support` | read+write | Support tickets and chat history |

**Intent scopes (v1.1 addendum):** `intent:read`, `intent:create`, `intent:write`, `intent:delete`

**Default recommended set (from MCP wrapper):** `["orders", "loyalty", "preferences", "intent:read", "intent:create"]`

**Custom merchant scopes:** `{merchant-identifier}:{scope-name}` (e.g. `acmeshop:vip-membership`)

---

## JSON-RPC 2.0 Data Endpoint (`POST /v1/rpc`)

ALL shopper data flows through this one endpoint — not per-scope REST routes.

### Request shape

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "scp.get_orders",
  "params": { "limit": 10, "offset": 0, "status": ["delivered", "shipped"] }
}
```

### Methods by scope

| Scope | Method |
|---|---|
| `orders` | `scp.get_orders` |
| `loyalty` | `scp.get_loyalty` |
| `offers` | `scp.get_offers` |
| `preferences` | `scp.get_preferences` |
| `intent:read` | `scp.get_intents` |
| `intent:create` | `scp.create_intent` |
| `intent:write` | `scp.update_intent`, `scp.fulfill_intent`, `scp.abandon_intent` |
| `intent:delete` | `scp.delete_intent` |

### Success response

```json
{ "jsonrpc": "2.0", "id": 1, "result": { "orders": [...], "pagination": { "next_cursor": "...", "has_more": true } } }
```

### Error response

```json
{ "jsonrpc": "2.0", "id": 1, "error": { "code": -32001, "message": "Forbidden", "data": { "details": "Insufficient scope" } } }
```

### Error codes

| Code | Meaning |
|---|---|
| -32700 | Parse error |
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32000 | Unauthorized (bad/expired token) |
| -32001 | Forbidden (insufficient scope) |
| -32002 | Not Found |
| -32003 | Rate Limited |
| -32004 | Shopper Not Found |

---

## OAuth Flow (production)

Magic-link + PKCE flow:

1. Client generates PKCE: random `code_verifier`, `code_challenge = BASE64URL(SHA256(code_verifier))`, `code_challenge_method = "S256"`
2. `POST /v1/authorize/init` → body: `{ email, client_id, scopes, code_challenge, code_challenge_method, state }`
3. Response: `{ auth_request_id, email_sent: true, expires_in: 600, poll_interval: 2 }`
4. Client polls `GET /v1/authorize/poll?auth_request_id=...&client_id=...` every 2s (max 150 attempts)
5. User clicks magic link → approves → server generates auth code (5-min TTL, single-use)
6. Poll returns `{ "status": "authorized", "code": "..." }`
7. `POST /v1/token` → body (form-encoded): `grant_type=authorization_code&code=...&code_verifier=...&client_id=...&redirect_uri=...`
8. Token response: `{ access_token, refresh_token, token_type: "Bearer", expires_in: 3600, scope, customer_id, email }`

**Token formats:**
- **Access token:** JWT, signed with HMAC SHA-256. Payload: `{ sub: customer_id, email, scopes: string[], type: "access_token", iat, exp }`. 1-hour TTL, stateless.
- **Refresh token:** Opaque random string. Stored in DB. 30-day TTL. Rotated on use.

**Demo/reference server simplification:** auto-approves all credentials, no real magic link, no PKCE verification, no JWT signing — demo-only. Documented intentional divergence.

---

## Token Endpoint

```
POST /v1/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=<auth_code>
&code_verifier=<pkce_verifier>
&client_id=<client_id>
&redirect_uri=<redirect_uri>
```

Refresh:
```
grant_type=refresh_token
&refresh_token=<token>
&client_id=<client_id>
```

---

## Rate Limits

- 100 requests/minute per token
- 1,000 requests/hour per token
- 10,000 requests/day per shopper

Recommended cache TTLs: orders 5 min · loyalty 15 min · offers 1 hr · preferences 1 hr

---

## npm Package

`@shoppercontextprotocol/local-mcp-server` — the MCP bridge. Runs as a local MCP server and handles auth flow + SCP calls on behalf of an AI assistant. Not a general-purpose SCP HTTP client library.

---

## Versioning

- Current: v1.0 draft. DNS identifier: `v=scp1`. Capabilities `protocol_version`: `"scp1"`.
- v1.1 addendum: intent persistence (see `scp_intent_spec_addendum.md`)
- v1.0 async addendum: DPoP for background agents (see `scp_async_agent_auth_addendum.md`)

---

## Reference Implementation Notes

The org's `scp-server-example` is a Cloudflare Workers implementation. Notable:
- D1 for token/auth code storage; KV for magic link tokens
- `cordial_contact_id` column name in D1 tables (Cordial CRM artifact — ignore for generic implementations)
- DNS resolver: Cloudflare `1.1.1.1`

---

## SCP Console Intentional Divergences (demo mode)

| Area | Spec | Console demo |
|---|---|---|
| Auth flow | Magic-link + PKCE | Auto-approve (no email) |
| Token format | Signed JWT | Opaque `scp_demo_*` string |
| PKCE | Required | Not implemented |
| Shopper identity | JWT `sub` claim | `shopper_id` in JSON-RPC params |
| Storage | Encrypted at rest | Not applicable (demo only) |
