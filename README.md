# DevSuites

**https://devsuites.dev** — Next.js (marketing `public/` + Lemon API at `/api/*`) on Coolify.

| Path | What |
|------|------|
| `/` | Suite hub |
| `/devdock/` … `/devcheck/` | Product pages |
| `/licenses` | Customer license portal (email + key login) |
| `/${ADMIN_PATH}` | Admin console (secret path; `/admin` returns 404) |
| `/api/health` | Health (+ DB check) |
| `/api/buy/:app` | Lemon checkout redirect |
| `/api/webhooks/lemon` | Signed webhooks → Postgres |
| `/api/test` | Mock harness (`LEMON_MOCK=1` only) |

## Local

```bash
cp .env.example .env.local   # set DATABASE_URL
npm install
npm run dev                  # LEMON_MOCK=1 on :3000
open http://127.0.0.1:3000/api/test
DATABASE_URL=… npm test      # smoke (needs Postgres)
```

## Deploy (Coolify)

1. Build from repo root **Dockerfile** (Node 22, `output: 'standalone'`)
2. Domain: **`devsuites.dev`**
3. Env: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PATH`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `LEMON_*` — **do not** set `LEMON_MOCK=1` in production
4. Lemon webhook URL: `https://devsuites.dev/api/webhooks/lemon`
5. Admin: set `ADMIN_PATH` in Coolify (not `/admin` — that URL 404s)
**Build pack:** prefer **Dockerfile**. If Nixpacks is selected, `nixpacks.toml` is used automatically.

See [`LEMON.md`](./LEMON.md).
