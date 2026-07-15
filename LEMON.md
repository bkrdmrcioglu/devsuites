# Lemon Squeezy — DevSuites

One store for all four apps. Checkout + webhooks live on the **same Next.js app** as the site.

## Checkout URLs

| App | Buy |
|-----|-----|
| DevDock | https://devsuites.dev/api/buy/devdock |
| DevMail | https://devsuites.dev/api/buy/devmail |
| DevSQL | https://devsuites.dev/api/buy/devsql |
| DevCheck | https://devsuites.dev/api/buy/devcheck |

## Products (Test mode first)

| Product | Price | License keys |
|---------|-------|--------------|
| DevDock Pro | $29 one-time | On |
| DevMail Pro | $19 one-time | On |
| DevSQL Pro | $19 one-time | On |
| DevCheck Pro | $19 one-time | On |

## Architecture

1. `/api/buy/:app` creates Lemon checkout (Admin API key **server-only**) → 302  
2. Lemon emails license key  
3. Webhook `https://devsuites.dev/api/webhooks/lemon` (HMAC) → Postgres `events` + `licenses`  
4. Customer portal: https://devsuites.dev/licenses (email + one license key)  
5. Admin: `https://devsuites.dev/<ADMIN_PATH>` (secret slug; `/admin` returns 404) — list customers, issue `DS-…` keys  
6. Mac app Settings → Activate (Lemon public API, falls back to DevSuites for admin keys)

## Env (Coolify)

- `DATABASE_URL` — Postgres connection string (required)
- `SESSION_SECRET` — cookie signing (or falls back to `LEMON_WEBHOOK_SECRET`)
- `ADMIN_PATH` — secret admin UI slug (e.g. `ops-a8f3x`; never `admin`)
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin panel login
- `LEMON_API_KEY`, `LEMON_STORE_ID`, `LEMON_WEBHOOK_SECRET`
- `LEMON_VARIANT_DEVDOCK` / `_DEVMAIL` / `_DEVSQL` / `_DEVCHECK`
## Coolify tip

Set build pack to **Dockerfile** (repo root). Nixpacks also works via `nixpacks.toml`.

## Local mock

```bash
# .env.local needs DATABASE_URL
npm run dev
open http://127.0.0.1:3000/api/test
open http://127.0.0.1:3000/licenses
```

Never enable `LEMON_MOCK=1` in production.
