import { NextResponse } from "next/server";
import {
  GITHUB_OAUTH_STATE_COOKIE,
  appOrigin,
  createOAuthState,
  githubAuthorizeUrl,
  githubOAuthConfigured,
} from "@/lib/githubOAuth";
import { isSecureRequest } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const origin = await appOrigin();

  if (!githubOAuthConfigured()) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("GitHub login is not configured yet."),
        origin
      )
    );
  }

  try {
    const state = createOAuthState();
    const url = await githubAuthorizeUrl(state);
    const res = NextResponse.redirect(url);
    res.cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: await isSecureRequest(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });
    return res;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "GitHub login failed to start";
    return NextResponse.redirect(
      new URL("/login?error=" + encodeURIComponent(message), origin)
    );
  }
}
