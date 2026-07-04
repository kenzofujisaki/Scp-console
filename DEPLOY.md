# Deploying to Railway

SCP Console is a demo: a Next.js UI **plus** a bundled SCP reference server. The
simplest deploy runs both in **one** Railway service — the production mirror of
`npm run dev`. No cross-service networking, no second domain.

## Steps

Railway auto-detects the workspace packages and may create a service per package
(`@scp/protocol`, `@scp/client`, `@scp/reference-server`). Those are two
libraries and an internal server — **none of them serves the UI**. Delete all
three.

Then create a single service from this repo:

1. **New Service → GitHub Repo →** this repository.
2. **Settings → Root Directory:** `/` (the repo root). Railway reads
   `railway.json` from here.
3. It builds with `npm run build` and starts with `npm run start:demo`, which
   runs the Next app (on Railway's `$PORT`) and the Hono reference server (on
   `localhost:8787`) together in the same container.
4. **Settings → Networking → Generate Domain.** Open it — you land on the
   onboarding page, and "Explore the live demo" works end to end.

## Why one service works

- `start:demo` runs both processes via `concurrently`: `next start` binds
  Railway's public `$PORT`; the reference server binds `localhost:8787`.
- The app's default `SCP_TEST_ENDPOINT=http://localhost:8787/v1` reaches the
  reference server **inside the same container**, so Fetch Context / Run Request
  return real data with zero extra configuration.

## Environment variables

All optional — the defaults are correct for the bundled demo:

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_PATH` | `./scp-console.db` | SQLite path. Ephemeral on Railway; the DB re-seeds on first visit. |
| `SCP_TEST_ENDPOINT` | `http://localhost:8787/v1` | Leave as-is to use the bundled reference server. |
| `SCP_ALLOW_PRIVATE_ENDPOINTS` | `false` | Only needed if you point "connect your own server" at a private host. |

## Notes

- **Data is ephemeral** (SQLite on the container filesystem) — expected for a
  demo; it re-seeds automatically.
- Node **20** is pinned via `engines` in `package.json`.
- If you'd rather split the app and the reference server into two services,
  deploy the reference server separately and set the web service's
  `SCP_TEST_ENDPOINT` to its URL (public domain, or `*.railway.internal` over
  Railway's private network). The single-service setup above is simpler for a demo.
