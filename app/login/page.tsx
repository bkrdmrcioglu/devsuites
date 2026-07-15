import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, decodeSession } from "@/lib/session";
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
  const jar = await cookies();
  const session = decodeSession(jar.get(SESSION_COOKIE)?.value);
  if (session?.email) redirect("/account");

  const params = searchParams ? await searchParams : {};
  const oauthError = typeof params.error === "string" ? params.error : null;

  return (
    <LoginClient
      oauthError={oauthError}
      githubEnabled={githubOAuthConfigured()}
    />
  );
}
