import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureStore } from "@/lib/store";
import {
  SESSION_COOKIE,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/session";
import { isSecureRequest } from "@/lib/http";
import {
  GITHUB_OAUTH_STATE_COOKIE,
  appOrigin,
  exchangeGithubCode,
  fetchGithubProfile,
  verifyOAuthState,
} from "@/lib/githubOAuth";
import { upsertGithubUser } from "@/lib/users";

export const runtime = "nodejs";

function clearStateCookie(res: NextResponse, secure: boolean) {
  res.cookies.set(GITHUB_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(req: Request) {
  const origin = await appOrigin();
  const secure = await isSecureRequest();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const jar = await cookies();
  const stateCookie = jar.get(GITHUB_OAUTH_STATE_COOKIE)?.value;

  if (oauthError) {
    const res = NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("GitHub sign-in was cancelled.")}`,
        origin
      )
    );
    clearStateCookie(res, secure);
    return res;
  }

  if (!code || !verifyOAuthState(state) || !stateCookie || stateCookie !== state) {
    const res = NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Invalid GitHub sign-in state. Try again.")}`,
        origin
      )
    );
    clearStateCookie(res, secure);
    return res;
  }

  try {
    await ensureStore();
    const token = await exchangeGithubCode(code);
    const profile = await fetchGithubProfile(token);
    const result = await upsertGithubUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });
    if (!result.ok) {
      const res = NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(result.error)}`, origin)
      );
      clearStateCookie(res, secure);
      return res;
    }

    const res = NextResponse.redirect(new URL("/login", origin));
    res.cookies.set(
      SESSION_COOKIE,
      encodeSession(result.email),
      await sessionCookieOptions()
    );
    clearStateCookie(res, secure);
    return res;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "GitHub sign-in failed";
    const res = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, origin)
    );
    clearStateCookie(res, secure);
    return res;
  }
}
