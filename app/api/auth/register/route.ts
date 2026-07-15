import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/session";
import { ensureStore } from "@/lib/store";
import { createUser } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    await ensureStore();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const result = await createUser({ email, password });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Registration failed" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true, email: email.toLowerCase() });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession(email),
    await sessionCookieOptions()
  );
  return res;
}
