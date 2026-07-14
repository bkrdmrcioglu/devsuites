import { NextResponse } from "next/server";
import {
  escapeHtml,
  isAppSlug,
  isMockMode,
  mockLicenseKey,
} from "@/lib/lemon";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ app: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Enable LEMON_MOCK=1" }, { status: 404 });
  }
  const { app: raw } = await ctx.params;
  const slug = raw.toLowerCase();
  if (!isAppSlug(slug)) {
    return NextResponse.json({ error: "Unknown app" }, { status: 404 });
  }
  const key = mockLicenseKey(slug);
  return new NextResponse(
    `<!doctype html><meta charset="utf-8">
<title>Mock paid — ${escapeHtml(slug)}</title>
<body style="font:16px/1.45 system-ui;max-width:40rem;margin:2.5rem auto;padding:0 1rem;background:#0f1216;color:#e8ecef">
<h1 style="color:#2ed68c">Payment simulated</h1>
<p>App: <strong>${escapeHtml(slug)}</strong></p>
<pre style="background:#1a1f26;padding:12px;border-radius:8px;overflow:auto">${escapeHtml(key)}</pre>
<p><a style="color:#2ed68c" href="/api/test/fire-webhook/${escapeHtml(slug)}">Fire order + license webhooks →</a></p>
<p><a style="color:#9aa3ad" href="/api/test">Back</a></p>
</body>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
