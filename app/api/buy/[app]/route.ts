import { NextResponse } from "next/server";
import {
  createCheckout,
  escapeHtml,
  isAppSlug,
  requestOrigin,
  requireConfig,
  variantIdFor,
} from "@/lib/lemon";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ app: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { app: raw } = await ctx.params;
  const slug = raw.toLowerCase();
  if (!isAppSlug(slug)) {
    return NextResponse.json(
      { error: "Unknown app", apps: ["devdock", "devmail", "devsql", "devcheck"] },
      { status: 404 }
    );
  }

  try {
    const { apiKey, storeId } = requireConfig();
    const variantId = variantIdFor(slug);
    const url = await createCheckout({
      apiKey,
      storeId,
      variantId,
      app: slug,
      origin: requestOrigin(req),
    });
    return NextResponse.redirect(url, 302);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    const missingEnv = /Missing /.test(message);
    const status = missingEnv ? 503 : 502;
    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html")) {
      return new NextResponse(
        `<!doctype html><meta charset="utf-8"><title>Checkout unavailable</title>
         <body style="font:16px/1.4 system-ui;max-width:36rem;margin:3rem auto;padding:0 1rem">
         <h1>Checkout unavailable</h1>
         <p>${escapeHtml(message)}</p>
         <p><a href="/${slug}/">Back to ${escapeHtml(slug)}</a></p>
         </body>`,
        { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    return NextResponse.json({ error: message }, { status });
  }
}
