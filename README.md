# SCP Console

**The human control plane for the Shopper Context Protocol.**

Onboard a merchant onto SCP in ten minutes. See exactly what shopper context you expose to AI. Prove every request. Nothing else.

---

## What this is

The [Shopper Context Protocol](https://shoppercontextprotocol.com) (SCP) makes shopper data available to any LLM through one open standard. SCP Console is the governance layer that sits alongside an SCP server and gives humans:

1. **Visibility** — a plain-language view of what an AI assistant actually receives when it queries your endpoint
2. **Control** — per-data-type scope toggles that take effect on the next request
3. **Proof** — a complete audit log of every request, every scope decision, and every policy change — exportable for compliance sign-off

This is not a proxy. It is a control plane. Shopper data stays in your infrastructure; the Console only stores request metadata.

---

## Quick start

```bash
git clone https://github.com/kenzofujisaki/scp-console.git
cd scp-console
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You land on the Acme Outdoor Co. reference merchant — zero configuration required.

`npm run dev` starts two processes simultaneously:
- **SCP Console** (Next.js) → `http://localhost:3000`
- **Reference SCP server** (Hono) → `http://localhost:8787`

---

## Architecture

```
Browser ──▶ Next.js Console (port 3000)
                │
                ├── API routes (Node.js, better-sqlite3)
                │       │
                │       └── SQLite DB (scope settings, audit metadata)
                │
                └── Proxy calls ──▶ SCP Server (port 8787 / your endpoint)
                                           │
                                           └── Returns shopper context (PII stays here)
```

### Key design decisions

**SQLite, not Supabase** — zero-setup for local use. No external account needed. Ready for Supabase migration when multi-tenancy matters.

**Bundled reference server** — ships inside the repo. Onboarding works offline with no live URL to depend on. The demo never breaks because an upstream server moved.

**Auto-migration** — `getDb()` runs Drizzle migrations on first call, so `npm run dev` is the only setup step.

**No auth in v1** — the Console is self-hosted and single-user. Auth deferred until multi-tenancy.

> For deeper detail — critical paths, conventions, the data model, and the full SCP protocol reference — see [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Data model

| Table | Purpose |
|---|---|
| `merchants` | SCP endpoint registry (reference + custom) |
| `scope_settings` | Per-merchant, per-scope exposed/blocked state |
| `test_runs` | Raw request records (no shopper payload) |
| `audit_events` | Actor, requested scopes, returned types, status, latency |
| `policy_changes` | Who changed a scope, from what to what, and when |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./scp-console.db` | SQLite file path |
| `SCP_TEST_ENDPOINT` | `http://localhost:8787/v1` | Active SCP server base URL |
| `SCP_ALLOW_PRIVATE_ENDPOINTS` | `false` | SSRF opt-out — set `true` to connect the Console to a localhost/private SCP server in dev |

Copy `.env.example` to `.env` and override as needed. All values have sensible defaults for the bundled demo.

---

## Connecting your own SCP server

1. Go to `http://localhost:3000/onboarding`
2. Choose "Connect My SCP Server"
3. Enter your endpoint URL (e.g. `https://scp.mystore.com/v1`)
4. The Console discovers it via `/.well-known/shopper-context-protocol` and verifies it responds
5. Click Save — the dashboard now governs your real endpoint

Your server must:
- Serve `GET /.well-known/shopper-context-protocol` → JSON with discovery metadata
- Expose `GET /v1/capabilities` → declared scopes and endpoints
- Implement `POST /v1/token` (`authorization_code` grant; demo auto-approves)
- Implement `POST /v1/rpc` (JSON-RPC 2.0) with Bearer auth for all data methods

---

## SCP Reference Server

The bundled reference merchant ("Acme Outdoor Co.") lives in `packages/reference-server/`. It is a minimal but complete SCP implementation built with [Hono](https://hono.dev).

Endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/.well-known/shopper-context-protocol` | Discovery metadata |
| `GET` | `/v1/capabilities` | Declared scopes and endpoints |
| `POST` | `/v1/token` | Token (auto-approves all credentials in demo) |
| `POST` | `/v1/rpc` | JSON-RPC 2.0 dispatcher for all data methods |
| `GET` | `/health` | Health check |

Five pre-loaded shoppers: `shopper_001` – `shopper_005`.

Scopes: `orders`, `loyalty`, `offers`, `preferences`.

---

## Development

```bash
npm run dev          # Start both processes
npm run dev:console  # Next.js only
npm run dev:server   # Reference SCP server only

npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest unit tests

npm run db:generate  # Regenerate migrations after schema changes
npm run db:migrate   # Run pending migrations
npm run db:studio    # Drizzle Studio
```

---

## Deploying

The demo deploys as a **single service** that runs the Console and the bundled
reference server together (`npm run start:demo`) — the production mirror of
`npm run dev`, so the live demo works with zero configuration. Full instructions,
including the two-service split for pointing at a real SCP endpoint, are in
[`DEPLOY.md`](DEPLOY.md).

---

## Scope

### v1 (this release)

- Bundled reference SCP server + Acme Outdoor Co. fake merchant
- Zero-setup entry — no account, no signup
- Context browser, request tester, scope controls, audit log + CSV export
- Connect-your-own-server onboarding flow

### Planned fast-follows

- **Scaffold generator** — emit a starter SCP server from the Console itself, closing the implementation cliff
- Real multi-merchant tenancy and auth
- Anomaly detection on request patterns
- Policy alerts (e.g. high-sensitivity scope suddenly enabled)

---

## License

MIT — see [LICENSE](LICENSE).
