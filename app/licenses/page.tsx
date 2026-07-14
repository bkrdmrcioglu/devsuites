import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  decodeSession,
} from "@/lib/session";
import { ensureStore, findLicensesByEmail } from "@/lib/store";
import { LicensesClient } from "./LicensesClient";

export const metadata: Metadata = {
  title: "Licenses — DevSuites",
  description: "View your DevSuites product license keys",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LicensesPage() {
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
    <LicensesClient
      email={email}
      licenses={licenses}
      dbError={dbError}
    />
  );
}
