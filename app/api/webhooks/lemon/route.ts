import { NextResponse } from "next/server";
import { requireConfig, verifyWebhook } from "@/lib/lemon";
import {
  ensureStore,
  insertEvent,
  insertOrderSummary,
  summarizeWebhook,
} from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await ensureStore();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  let secret: string;
  try {
    secret = requireConfig().webhookSecret;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Misconfigured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? undefined;
  if (!verifyWebhook(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    parsed = null;
  }

  const eventName =
    req.headers.get("x-event-name") ??
    (parsed as { meta?: { event_name?: string } } | null)?.meta?.event_name ??
    "unknown";

  await insertEvent(eventName, rawBody);

  if (parsed) {
    const summary = summarizeWebhook(eventName, parsed);
    if (
      eventName === "order_created" ||
      eventName === "license_key_created" ||
      eventName.includes("order") ||
      eventName.includes("license")
    ) {
      await insertOrderSummary({ eventName, ...summary });
    }
  }

  return NextResponse.json({ received: true });
}
