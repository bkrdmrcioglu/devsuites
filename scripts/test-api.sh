#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
BASE="http://127.0.0.1:${PORT}"
DATA_DIR="${DATA_DIR:-$ROOT/data-test}"
rm -rf "$DATA_DIR"
mkdir -p "$DATA_DIR"

export LEMON_MOCK=1
export PORT
export DATA_DIR
export LEMON_WEBHOOK_SECRET="${LEMON_WEBHOOK_SECRET:-mock_webhook_secret}"

# Kill leftover
pkill -f "next start -p ${PORT}" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 0.5

npm run build

LEMON_MOCK=1 DATA_DIR="$DATA_DIR" PORT="$PORT" \
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

echo "==> home rewrite"
curl -sf "$BASE/" | head -c 200 | grep -qi 'DevSuites'

echo ""
echo "OK — Next.js /api mock smoke passed"
