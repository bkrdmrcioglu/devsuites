import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, decodeAdminSession } from "@/lib/admin";
import {
  ensureStore,
  listAdminLicenses,
  listCustomers,
} from "@/lib/store";
import { AdminClient } from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin — DevSuites",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  const authed = decodeAdminSession(jar.get(ADMIN_COOKIE)?.value);

  let customers: Awaited<ReturnType<typeof listCustomers>> = [];
  let licenses: Awaited<ReturnType<typeof listAdminLicenses>> = [];
  let dbError: string | null = null;

  if (authed) {
    try {
      await ensureStore();
      [customers, licenses] = await Promise.all([
        listCustomers(),
        listAdminLicenses(300),
      ]);
    } catch (err) {
      dbError = err instanceof Error ? err.message : "Database unavailable";
    }
  }

  return (
    <AdminClient
      authed={authed}
      customers={customers}
      licenses={licenses}
      dbError={dbError}
    />
  );
}
