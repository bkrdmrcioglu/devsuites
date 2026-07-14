import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  encodeAdminSession,
  verifyAdminPassword,
} from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (!verifyAdminPassword(body.password ?? "")) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Misconfigured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, encodeAdminSession(), adminCookieOptions());
  return res;
}
