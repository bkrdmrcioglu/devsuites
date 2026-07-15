import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  encodeAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim() || "admin";
  const password = body.password ?? "";

  try {
    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Misconfigured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    ADMIN_COOKIE,
    encodeAdminSession(),
    await adminCookieOptions()
  );
  return res;
}
