import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function adminPathSlug(): string | null {
  const raw = (process.env.ADMIN_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!raw || raw.toLowerCase() === "admin") {
    // Dev fallback when env is missing (matches lib/admin.ts)
    if (process.env.NODE_ENV !== "production") return "ops-local";
    return null;
  }
  return raw;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clean = pathname.replace(/\/+$/, "") || "/";
  const secret = adminPathSlug();

  // Public /admin is never exposed
  if (clean === "/admin" || clean.startsWith("/admin/")) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Secret slug → internal /admin app route (URL bar keeps the secret path)
  if (secret) {
    const prefix = `/${secret}`;
    if (clean === prefix || clean.startsWith(`${prefix}/`)) {
      const url = request.nextUrl.clone();
      url.pathname =
        clean === prefix ? "/admin" : clean.replace(prefix, "/admin");
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    // Single-segment paths (the ADMIN_PATH secret slug)
    "/:slug",
    "/:slug/",
  ],
};
