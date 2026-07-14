import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/session";
import { ensureStore, verifyLicenseLogin } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; licenseKey?: string };
  try {
    body = (await req.json()) as { email?: string; licenseKey?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const licenseKey = body.licenseKey?.trim() ?? "";
  if (!email || !licenseKey) {
    return NextResponse.json(
      { error: "Email and license key are required" },
      { status: 400 }
    );
  }

  try {
    await ensureStore();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const ok = await verifyLicenseLogin(email, licenseKey);
  if (!ok) {
    return NextResponse.json(
      { error: "No matching license for that email and key" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, email: email.toLowerCase() });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession(email),
    sessionCookieOptions()
  );
  return res;
}
