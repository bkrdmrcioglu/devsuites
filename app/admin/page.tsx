import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminPublicPath,
  decodeAdminSession,
} from "@/lib/admin";
import {
  ensureStore,
  listAdminLicenses,
  listCustomers,
} from "@/lib/store";
import { AdminClient } from "./AdminClient";
import { AdminLogin } from "./AdminLogin";

export const metadata: Metadata = {
  title: "Admin — DevSuites",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const publicPath = adminPublicPath();
  const params = await searchParams;
  if ("password" in params || "username" in params) {
    redirect(publicPath);
  }

  const jar = await cookies();
  const authed = decodeAdminSession(jar.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return <AdminLogin publicPath={publicPath} />;
  }

  let customers: Awaited<ReturnType<typeof listCustomers>> = [];
  let licenses: Awaited<ReturnType<typeof listAdminLicenses>> = [];
  let dbError: string | null = null;

  try {
    await ensureStore();
    [customers, licenses] = await Promise.all([
      listCustomers(),
      listAdminLicenses(300),
    ]);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Database unavailable";
  }

  return (
    <AdminClient
      customers={customers}
      licenses={licenses}
      dbError={dbError}
    />
  );
}
