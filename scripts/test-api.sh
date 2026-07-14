#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
BASE="http://127.0.0.1:${PORT}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required for npm test (Postgres)"
  exit 1
fi

export LEMON_MOCK=1
export PORT
export DATABASE_URL
export LEMON_WEBHOOK_SECRET="${LEMON_WEBHOOK_SECRET:-mock_webhook_secret}"
export SESSION_SECRET="${SESSION_SECRET:-mock_session_secret_for_tests}"

# Kill leftover
pkill -f "next start -p ${PORT}" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 0.5

npm run build

LEMON_MOCK=1 DATABASE_URL="$DATABASE_URL" PORT="$PORT" \
  SESSION_SECRET="$SESSION_SECRET" LEMON_WEBHOOK_SECRET="$LEMON_WEBHOOK_SECRET" \
  npx next start -p "$PORT" &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; }
trap cleanup EXIT

for i in $(seq 1 40); do
  if curl -sf "$BASE/api/health" >/dev/null; then break; fi
  sleep 0.25
done

echo "==> health"
curl -sf "$BASE/api/health" | tee /tmp/ds-health.json
echo
grep -q '"mock":true' /tmp/ds-health.json
grep -q '"db":"ok"' /tmp/ds-health.json

echo "==> buy redirect"
LOC=$(curl -sI "$BASE/api/buy/devsql" | tr -d '\r' | awk 'tolower($1)=="location:" {print $2}')
echo "location: $LOC"
[[ "$LOC" == *"/api/test/checkout/devsql"* ]]

echo "==> fire webhooks"
curl -sf -X POST "$BASE/api/test/fire-webhook/devsql" -H 'accept: application/json' | tee /tmp/ds-fire.json
echo
grep -q '"ok":true' /tmp/ds-fire.json

echo "==> orders"
curl -sf "$BASE/api/test/orders" | tee /tmp/ds-orders.json
echo
grep -q 'MOCK-DEVSQL-PRO' /tmp/ds-orders.json

# Extract email + key from orders for portal login
EMAIL=$(node -e "const j=require('/tmp/ds-orders.json'); const o=j.orders.find(x=>x.licenseKey); if(!o) process.exit(1); process.stdout.write(o.email)")
KEY=$(node -e "const j=require('/tmp/ds-orders.json'); const o=j.orders.find(x=>x.licenseKey); if(!o) process.exit(1); process.stdout.write(o.licenseKey)")

echo "==> login portal"
curl -sf -c /tmp/ds-cookies.txt -H 'content-type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"licenseKey\":\"$KEY\"}" \
  "$BASE/api/auth/login" | tee /tmp/ds-login.json
echo
grep -q '"ok":true' /tmp/ds-login.json

echo "==> list licenses"
curl -sf -b /tmp/ds-cookies.txt "$BASE/api/licenses" | tee /tmp/ds-licenses.json
echo
grep -q 'MOCK-DEVSQL-PRO' /tmp/ds-licenses.json

echo "==> licenses page"
curl -sf "$BASE/licenses" | grep -qi 'Licenses'

echo "==> home rewrite"
curl -sf "$BASE/" | head -c 200 | grep -qi 'DevSuites'

echo ""
echo "OK — Next.js /api mock smoke passed"
