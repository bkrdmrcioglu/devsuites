import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isSecureRequest } from "@/lib/http";

export const SESSION_COOKIE = "devsuites_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  email: string;
  exp: number;
};

function sessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.LEMON_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET or LEMON_WEBHOOK_SECRET is required");
  }
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", sessionSecret()).update(data).digest("base64url");
}

export function encodeSession(email: string): string {
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const expected = sign(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload.email || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function sessionCookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getSessionEmail(): Promise<string | null> {
  const jar = await cookies();
  const session = decodeSession(jar.get(SESSION_COOKIE)?.value);
  return session?.email ?? null;
}
