import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { isSecureRequest } from "@/lib/http";

export const ADMIN_COOKIE = "devsuites_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

type AdminPayload = { role: "admin"; exp: number };

/** Normalized admin UI slug from ADMIN_PATH (no leading/trailing slashes). */
export function adminPathSlug(): string {
  const raw = (process.env.ADMIN_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!raw || raw.toLowerCase() === "admin") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        'ADMIN_PATH is required and must not be "admin" (use a secret slug)'
      );
    }
    return "ops-local";
  }
  return raw;
}

/** Public URL path for the admin UI, e.g. `/ops-a8f3x`. */
export function adminPublicPath(): string {
  return `/${adminPathSlug()}`;
}

export function isAdminUiPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === adminPublicPath();
}

function sessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.LEMON_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET or LEMON_WEBHOOK_SECRET is required");
  }
  return secret;
}

function adminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || "admin";
}

function adminPassword(): string {
  const pw = process.env.ADMIN_PASSWORD?.trim();
  if (!pw) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return pw;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const userOk = safeEqual(username.trim(), adminUsername());
  const passOk = safeEqual(password, adminPassword());
  // Always check both so timing doesn't leak which field failed
  return userOk && passOk;
}

/** @deprecated Prefer verifyAdminCredentials */
export function verifyAdminPassword(password: string): boolean {
  return verifyAdminCredentials(adminUsername(), password);
}

function sign(data: string): string {
  return createHmac("sha256", sessionSecret()).update(data).digest("base64url");
}

export function encodeAdminSession(): string {
  const payload: AdminPayload = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${body}.${sign(body)}`;
}

export function decodeAdminSession(
  token: string | undefined | null
): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  try {
    const expected = sign(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as AdminPayload;
    if (payload.role !== "admin") return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export async function adminCookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: await isSecureRequest(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return decodeAdminSession(jar.get(ADMIN_COOKIE)?.value);
}

export function newManualLicenseKey(app: string): string {
  const part = () => randomBytes(2).toString("hex").toUpperCase();
  return `DS-${app.toUpperCase()}-${part()}-${part()}-${part()}-${part()}`;
}
