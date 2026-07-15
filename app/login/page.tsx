import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  decodeSession,
} from "@/lib/session";
import { ensureStore, findLicensesByEmail } from "@/lib/store";
import { githubOAuthConfigured } from "@/lib/githubOAuth";
import { LoginClient } from "./LoginClient";

export const metadata: Metadata = {
  title: "Login — DevSuites",
  description: "Sign in to your DevSuites account or create one",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const oauthError = typeof params.error === "string" ? params.error : null;

  const jar = await cookies();
  const session = decodeSession(jar.get(SESSION_COOKIE)?.value);
  const email = session?.email ?? null;

  let licenses: Awaited<ReturnType<typeof findLicensesByEmail>> = [];
  let dbError: string | null = null;

  if (email) {
    try {
      await ensureStore();
      licenses = await findLicensesByEmail(email);
    } catch (err) {
      dbError = err instanceof Error ? err.message : "Database unavailable";
    }
  }

  return (
    <LoginClient
      email={email}
      licenses={licenses}
      dbError={dbError}
      oauthError={oauthError}
      githubEnabled={githubOAuthConfigured()}
    />
  );
}
