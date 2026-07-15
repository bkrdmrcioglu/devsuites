import { headers } from "next/headers";

/**
 * True when the current request actually arrived over HTTPS. `next start`
 * always sets NODE_ENV=production, so we can't infer this from NODE_ENV
 * alone — that would mark cookies `Secure` even on http://localhost, and
 * browsers silently refuse to store `Secure` cookies over plain HTTP.
 */
export async function isSecureRequest(): Promise<boolean> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  if (proto) return proto === "https";
  const host = h.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return false;
  }
  return process.env.NODE_ENV === "production";
}
