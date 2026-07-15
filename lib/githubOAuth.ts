import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";

export const GITHUB_OAUTH_STATE_COOKIE = "devsuites_gh_oauth";

function githubClientId(): string {
  return process.env.GITHUB_CLIENT_ID?.trim() ?? "";
}

function githubClientSecret(): string {
  return process.env.GITHUB_CLIENT_SECRET?.trim() ?? "";
}

export function githubOAuthConfigured(): boolean {
  return Boolean(githubClientId() && githubClientSecret());
}

function stateSecret(): string {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.LEMON_WEBHOOK_SECRET?.trim() ||
    githubClientSecret();
  if (!secret) throw new Error("SESSION_SECRET is required for GitHub OAuth");
  return secret;
}

export function createOAuthState(): string {
  const nonce = randomBytes(16).toString("base64url");
  const sig = createHmac("sha256", stateSecret())
    .update(nonce)
    .digest("base64url");
  return `${nonce}.${sig}`;
}

export function verifyOAuthState(state: string | null | undefined): boolean {
  if (!state) return false;
  const [nonce, sig] = state.split(".");
  if (!nonce || !sig) return false;
  const expected = createHmac("sha256", stateSecret())
    .update(nonce)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function appOrigin(): Promise<string> {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) throw new Error("Cannot determine app URL (set APP_URL)");
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  return `${proto}://${host}`;
}

export async function githubCallbackUrl(): Promise<string> {
  return `${await appOrigin()}/api/auth/github/callback`;
}

export async function githubAuthorizeUrl(state: string): Promise<string> {
  const id = githubClientId();
  if (!id) throw new Error("GITHUB_CLIENT_ID is not configured");
  const params = new URLSearchParams({
    client_id: id,
    redirect_uri: await githubCallbackUrl(),
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGithubCode(code: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: githubClientId(),
      client_secret: githubClientSecret(),
      code,
      redirect_uri: await githubCallbackUrl(),
    }),
  });
  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "GitHub token exchange failed"
    );
  }
  return data.access_token;
}

type GhUser = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type GhEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

export async function fetchGithubProfile(accessToken: string): Promise<{
  id: number;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}> {
  const headersInit = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "DevSuites",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const userRes = await fetch("https://api.github.com/user", {
    headers: headersInit,
  });
  if (!userRes.ok) {
    throw new Error("Failed to load GitHub profile");
  }
  const user = (await userRes.json()) as GhUser;

  let email = user.email?.trim() || null;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: headersInit,
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as GhEmail[];
      const primaryVerified =
        emails.find((e) => e.primary && e.verified) ??
        emails.find((e) => e.verified) ??
        emails.find((e) => e.primary);
      email = primaryVerified?.email?.trim() || null;
    }
  }

  if (!email) {
    throw new Error(
      "No verified email on your GitHub account. Add one in GitHub settings."
    );
  }

  return {
    id: user.id,
    email,
    name: user.name || user.login || null,
    avatarUrl: user.avatar_url,
  };
}
