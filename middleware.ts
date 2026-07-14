import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRODUCT_PAGES = new Set(["devdock", "devmail", "devsql", "devcheck"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/home.html", request.url));
  }

  const slug = pathname.replace(/^\/+|\/+$/g, "");
  if (PRODUCT_PAGES.has(slug)) {
    return NextResponse.rewrite(new URL(`/${slug}/index.html`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/devdock", "/devdock/", "/devmail", "/devmail/", "/devsql", "/devsql/", "/devcheck", "/devcheck/"],
};
