import { NextResponse } from "next/server";
import {
  escapeHtml,
  isAppSlug,
  isMockMode,
  mockOrderPayload,
  requestOrigin,
  requireConfig,
  signWebhook,
} from "@/lib/lemon";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ app: string }> };

export async function GET(req: Request, ctx: Ctx) {
  return fire(req, ctx);
}

export async function POST(req: Request, ctx: Ctx) {
  return fire(req, ctx);
}

async function fire(req: Request, ctx: Ctx) {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Enable LEMON_MOCK=1" }, { status: 404 });
  }
  const { app: raw } = await ctx.params;
  const slug = raw.toLowerCase();
  if (!isAppSlug(slug)) {
    return NextResponse.json({ error: "Unknown app" }, { status: 404 });
  }

  const { webhookSecret } = requireConfig();
  const origin = requestOrigin(req);
  const results: unknown[] = [];

  for (const eventName of ["order_created", "license_key_created"] as const) {
    const payload = JSON.stringify(mockOrderPayload(slug, eventName));
    const signature = signWebhook(payload, webhookSecret);
    const res = await fetch(`${origin}/api/webhooks/lemon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
        "X-Event-Name": eventName,
      },
      body: payload,
    });
    results.push({
      eventName,
      status: res.status,
      body: await res.json().catch(() => null),
    });
  }

  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    return new NextResponse(
      `<!doctype html><meta charset="utf-8">
<title>Webhooks fired</title>
<body style="font:16px/1.45 system-ui;max-width:40rem;margin:2.5rem auto;padding:0 1rem;background:#0f1216;color:#e8ecef">
<h1 style="color:#2ed68c">Webhooks fired</h1>
<pre style="background:#1a1f26;padding:12px;border-radius:8px">${escapeHtml(JSON.stringify(results, null, 2))}</pre>
<p><a style="color:#2ed68c" href="/api/test/orders">View orders</a></p>
</body>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  return NextResponse.json({ ok: true, results });
}
