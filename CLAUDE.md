# SCP Console — Claude Code Context

## What this is

SCP Console is the human control plane for the Shopper Context Protocol. It's a Next.js 14 web app (App Router) that lets operators see what their SCP endpoint exposes to AI assistants, control it via scope toggles, and audit every request — all without storing shopper PII.

## Running the project

```bash
npm install       # Installs the root app + all workspace packages (npm workspaces: packages/*)
npm run dev       # Starts both Next.js (port 3000) and the Hono reference server (port 8787)
```

On first `npm run dev`, Drizzle automatically migrates the SQLite DB and the `/api/init` call seeds the reference merchant.

## Key commands

```bash
npm run lint            # ESLint
npm run typecheck       # TypeScript strict mode check (no anys)
npm test                # Vitest unit tests
npm run db:generate     # Regenerate migrations after schema changes (drizzle-kit generate:sqlite)
npm run db:studio       # Drizzle Studio UI for inspecting the DB
```

## Architecture

| Layer | Tech | Location |
|---|---|---|
| Frontend | Next.js 14 App Router, Tailwind, shadcn/ui | `src/app/`, `src/components/` |
| API | Next.js API Routes, Node.js runtime | `src/app/api/` |
| DB | Drizzle ORM + better-sqlite3 (SQLite) | `src/lib/db/` |
| SCP protocol | Types, scopes, methods, error codes (zero deps) | `packages/protocol/` (`@scp/protocol`) |
| SCP client | Plain fetch, TypeScript | `packages/client/` (`@scp/client`) |
| Reference server | Hono.js | `packages/reference-server/` (`@scp/reference-server`) |

The protocol and client are real workspace packages consumed by both the Next
app and the reference server (imported as `@scp/protocol` / `@scp/client`, never
via reach-into-`src` relative paths). The app's `src/lib/scp/{types,client}.ts`
are thin barrels that re-export the packages and add app-only concerns
(`SCOPE_META`, `SCPProxyResult`). Resolution is wired via root `tsconfig` paths,
`vitest` aliases, and workspace symlinks (for `tsx`).

## Critical paths

- **`src/lib/db/index.ts`** — `getDb()` singleton. Auto-migrates on first call. All API routes use this. SQLite is synchronous — no `await` on DB calls.
- **`src/lib/db/schema.ts`** — Source of truth for all tables. After changing this, run `npm run db:generate` and commit the generated migration file.
- **`src/app/api/scp/context/route.ts`** — Core proxy route. Applies scope policy, calls SCP server, writes audit record. All in one transaction flow.
- **`packages/client/src/index.ts`** — `SCPClient` class (`@scp/client`; re-exported by the app barrel `src/lib/scp/client.ts`). Instantiate per-request (no global singleton). Token is cached inside the instance.
- **`packages/reference-server/src/index.ts`** — Hono entry point. All routes declared here.

## Conventions

- **TypeScript strict mode** — `"strict": true` in tsconfig. No `any` permitted (ESLint enforces). Use unknown + type guards at boundaries.
- **Conventional commits** — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **All API routes must declare** `export const runtime = "nodejs";` — prevents Next.js from using the Edge runtime, which can't load `better-sqlite3`.
- **No PII** — audit_events and test_runs store metadata only (scope names, status, latency). Never store shopper emails, names, or payload content.
- **Path alias** — use `@/` for all imports from `src/`. Never use relative `../../`.
- **No comments on obvious code.** Only add a comment when the WHY is non-obvious.

## DB schema summary

```
merchants          — id, name, scp_endpoint_url, is_reference, created_at
scope_settings     — id, merchant_id, data_type, exposed (bool), updated_at
test_runs          — id, merchant_id, shopper_id, requested_scopes (JSON), filtered_scopes (JSON), response_status, latency_ms, created_at
audit_events       — id, merchant_id, actor, requested_scopes (JSON), data_types_returned (JSON), status, latency_ms, occurred_at
policy_changes     — id, merchant_id, data_type, from_state, to_state, changed_at
```

`requestedScopes` and `dataTypesReturned` are stored as JSON strings (SQLite text). Parse with `parseJsonSafe()` from `@/lib/utils`.

## Reference SCP server

Fake merchant "Acme Outdoor Co." with 5 shoppers (`shopper_001` – `shopper_005`). Shoppers defined in `packages/reference-server/src/data/shoppers.ts`. The server auto-approves all OAuth token requests — it is demo-only.

Default scope policy (set in `src/lib/db/seed.ts`):
- `orders` → exposed
- `loyalty` → exposed
- `preferences` → exposed
- `offers` → **blocked** (demonstrates the governance toggle out of the box)

## SCP Protocol Reference

Full spec lives in `docs/scp-spec-reference.md`. Key facts to avoid drift:

**Canonical scope names (v1.0):** `orders`, `loyalty`, `offers`, `preferences`

**All data flows through one JSON-RPC 2.0 endpoint:**
```
POST /v1/rpc
{"jsonrpc":"2.0","id":1,"method":"scp.get_orders","params":{"shopper_id":"..."}}
```

| Scope | JSON-RPC method |
|---|---|
| `orders` | `scp.get_orders` |
| `loyalty` | `scp.get_loyalty` |
| `offers` | `scp.get_offers` |
| `preferences` | `scp.get_preferences` |

**Endpoints on the reference server (`http://localhost:8787`):**
- `GET /.well-known/shopper-context-protocol` → `{ version: "scp1", endpoint: "http://localhost:8787/v1" }`
- `GET /v1/capabilities` → full capabilities object
- `POST /v1/token` → demo auto-approve; returns `scp_demo_*` token
- `POST /v1/rpc` → JSON-RPC 2.0 dispatcher (requires `Authorization: Bearer scp_demo_*`)

**SCP client (`src/lib/scp/client.ts`):**
- `discover()` → `GET {baseUrl}/capabilities`
- `getToken()` → `POST {baseUrl}/token`
- `getContext(shopperId, scopes)` → parallel `POST {baseUrl}/rpc` per scope, results merged into `SCPShopper`

**Intentional demo divergences** (documented, not bugs):
- No real magic-link email — auto-approves all token requests
- No PKCE verification in demo flow
- Shopper identity via `shopper_id` in params instead of JWT `sub` claim

## Environment variables

```
DATABASE_PATH=./scp-console.db   # Path to SQLite file
SCP_TEST_ENDPOINT=http://localhost:8787/v1  # SCP server base URL
SCP_ALLOW_PRIVATE_ENDPOINTS=false  # SSRF opt-out — set true to connect to localhost/private hosts in dev
```

All have sensible defaults. Copy `.env.example` to `.env.local` for local overrides.

## UI, security & product conventions

- **Design tokens** — `src/app/globals.css` defines the HSL token layer (indigo
  `--primary`, layered surfaces) for **light and dark**. Use tokens
  (`bg-card`, `text-muted-foreground`, `border-border`) not hardcoded `slate-*`,
  so both themes work. Fixed accent chips (emerald/amber/rose) need `dark:` variants.
- **Theme** — no-FOUC `<script>` in `src/app/layout.tsx` sets the `dark` class
  before paint (localStorage `scp-theme` → system pref). Toggle:
  `src/components/theme/ThemeToggle.tsx`. Global `prefers-reduced-motion` rule
  neutralises animations.
- **Posture semantics** — a scope being **exposed** = emerald "live"; **blocked/withheld**
  = calm neutral, NOT error-red. Red/rose is reserved for genuine failures/denials
  (e.g. audit status). Sensitivity (risk) is a separate amber/rose axis.
- **SSRF guard** — `src/lib/security/url.ts`. Any user-supplied endpoint URL
  (`/api/scp/probe`, `POST /api/merchants`) must pass `assertSafeEndpointUrl` (sync,
  scheme + literal-host) AND `await assertEndpointResolvesPublic` (DNS resolve check).
  Never `fetch()` a raw user URL server-side without it.
- **First-run coach-mark** — the demo path lands on
  `/dashboard/scopes?coach=1`; `ScopeControls` shows a one-time spotlight
  (persisted via localStorage `scp-coached`) guiding the first `offers` flip.
- **Demo GIF** — `docs/media/first-run-demo.gif` (regenerate via Playwright
  video → PNG frames → `gifenc`; the bundled `/opt/pw-browsers` ffmpeg is
  recording-only, no gif encoder).

## Testing

Unit tests live in `src/test/` (Vitest, `vi.spyOn`/`vi.mock`); e2e in `e2e/`
(Playwright, `npm run test:e2e` — drives the real dev stack incl. reference server).
Current: **54 unit + 10 e2e**. When touching timestamps use `toDate()` from
`@/lib/utils` (Drizzle timestamps serialise to ISO strings over JSON — multiplying
by 1000 gives `NaN`). SSRF DNS checks take an injectable resolver so tests stay
network-free.

## Project status

Initial build is **merged to main** (PR #1). SCP is packaged as real workspaces;
the app, redesign (light/dark), onboarding funnel, coach-mark, and SSRF hardening
are all in. Per repo rules, start follow-up work from a fresh branch off `main`.
