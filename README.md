# DevSuites

**https://devsuites.dev** — Next.js (marketing `public/` + Lemon API at `/api/*`) on Coolify.

| Path | What |
|------|------|
| `/` | Suite hub |
| `/devdock/` … `/devcheck/` | Product pages |
| `/api/health` | Health |
| `/api/buy/:app` | Lemon checkout redirect |
| `/api/webhooks/lemon` | Signed webhooks |
| `/api/test` | Mock harness (`LEMON_MOCK=1` only) |

## Local

```bash
npm install
npm run dev          # LEMON_MOCK=1 on :3000
open http://127.0.0.1:3000/api/test
npm test             # smoke
```

## Deploy (Coolify)

1. Build from repo root **Dockerfile** (Node 22, `output: 'standalone'`)
2. Domain: **`devsuites.dev`** (no separate api subdomain)
3. Env: `LEMON_*` secrets; **do not** set `LEMON_MOCK=1` in production
4. Persist volume → `/data` (orders/events JSONL)
5. Lemon webhook URL: `https://devsuites.dev/api/webhooks/lemon`

**Build pack:** prefer **Dockerfile**. If Nixpacks is selected, `nixpacks.toml` is used automatically.

See [`LEMON.md`](./LEMON.md).
