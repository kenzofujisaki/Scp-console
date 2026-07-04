# Deploy Fix — Audit Notes

Reference for reviewing the changes that made SCP Console build and deploy
(Railway). All the deploy-enabling changes landed in **PR #4** (squashed on
`main` as `32ef6b6`). See the full diff with `git show 32ef6b6`. General
deployment instructions live in [`DEPLOY.md`](../DEPLOY.md).

## Root cause

`next build` was failing, which is what broke the Railway build. Next was
statically prerendering the `/dashboard/*` pages, which is invalid because they:

1. call `useSearchParams()` in client components without a Suspense boundary
   (Next's CSR-bailout error), and
2. read the SQLite DB (`getDb()`) at build time.

## Changes

### 1. Mark DB-/searchParams-dependent routes dynamic (build fix)

Added `export const dynamic = "force-dynamic";` to 8 files:

- `src/app/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/context/page.tsx`
- `src/app/dashboard/test/page.tsx`
- `src/app/dashboard/scopes/page.tsx`
- `src/app/dashboard/audit/page.tsx`
- `src/app/dashboard/connect/page.tsx`

Effect: these routes render on demand (not prerendered). `/onboarding` remains
static. In `next build` output they should read `ƒ (Dynamic)`.

### 2. `package.json`

- Added `start:demo` script — runs `next start` (public `$PORT`) + the reference
  server (`localhost:8787`) in one container via `concurrently`.
- `prepare`: `"husky"` → `"husky || true"` — so `npm install` never fails in
  CI/Railway when git hooks can't be installed. (Only swallows husky's own
  hook-setup step; does not mask app/build failures.)
- Added `engines.node: "20.x"` — pins the runtime for `better-sqlite3`'s native
  binary.
- Moved `tsx` from `devDependencies` → `dependencies` — the reference server runs
  via `tsx` at runtime, so it must survive a production install.

### 3. `railway.json` (new)

Builder NIXPACKS, `buildCommand: npm run build`, `startCommand: npm run
start:demo`, restart on failure.

### 4. Docs

- `DEPLOY.md` (new), `CLAUDE.md` (note that these routes stay `force-dynamic`),
  `package-lock.json` (regenerated for the `tsx` move), and this file.

## Verification

```bash
npm ci
npm run build            # must pass; dashboard routes = ƒ (Dynamic), /onboarding = ○ (Static)
npm run lint && npm run typecheck && npm test   # 54 unit tests, clean
npm run test:e2e         # 11 Playwright tests

# End-to-end demo in production mode:
npm run start:demo &
curl -s http://localhost:3000/onboarding -o /dev/null -w '%{http_code}\n'   # 200
curl -s http://localhost:8787/health -o /dev/null -w '%{http_code}\n'       # 200
MID=$(curl -s -XPOST http://localhost:3000/api/init | python3 -c 'import sys,json;print(json.load(sys.stdin)["merchant"]["id"])')
curl -s "http://localhost:3000/api/scp/context?merchantId=$MID&shopperId=shopper_001&scopes=orders,loyalty&actor=audit" \
  | python3 -c 'import sys,json;d=json.load(sys.stdin);print("HTTP",d["status"],"orders",len(d["data"].get("orders",[])))'
# Expect: HTTP 200 orders 2
```

## Known trade-offs / things to scrutinise

These are deliberate demo choices, called out for transparency:

- **One service runs two processes** (`concurrently`). Pragmatic for a demo, not
  a standard production pattern. The clean alternative — two services with the
  web app's `SCP_TEST_ENDPOINT` pointed at the reference server (public domain or
  `*.railway.internal`) — is documented in `DEPLOY.md`.
- **`tsx` at runtime** — the reference server runs TypeScript directly rather
  than a compiled bundle. Fine for a demo; a stricter setup would precompile it
  (e.g. esbuild/tsc) and run plain `node`.
- **Reference server binds a hardcoded `8787`** while Next takes `$PORT`. No
  collision in practice, but it isn't defensive if a platform ever set
  `PORT=8787`.
- **SQLite is ephemeral** on a container filesystem — it re-seeds on first visit
  after each deploy. Intended for a demo; not durable storage.
- **`force-dynamic` on all dashboard routes** means no static caching there.
  Correct for this app (per-merchant, live data), but confirm that's the intent
  before reusing the pattern elsewhere.
