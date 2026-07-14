import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/lemon";

export const runtime = "nodejs";

export async function GET() {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Enable LEMON_MOCK=1" }, { status: 404 });
  }
  return new NextResponse(
    `<!doctype html><meta charset="utf-8">
<title>DevSuites Lemon API — mock</title>
<body style="font:16px/1.45 system-ui;max-width:40rem;margin:2.5rem auto;padding:0 1rem;background:#0f1216;color:#e8ecef">
<h1 style="color:#2ed68c">Mock checkout API</h1>
<p>Same origin: <code>devsuites.dev/api/…</code>. No real Lemon charges.</p>
<ul>
  <li><a style="color:#2ed68c" href="/api/buy/devdock">/api/buy/devdock</a></li>
  <li><a style="color:#2ed68c" href="/api/buy/devmail">/api/buy/devmail</a></li>
  <li><a style="color:#2ed68c" href="/api/buy/devsql">/api/buy/devsql</a></li>
  <li><a style="color:#2ed68c" href="/api/buy/devcheck">/api/buy/devcheck</a></li>
  <li><a style="color:#2ed68c" href="/api/test/orders">/api/test/orders</a></li>
</ul>
</body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
