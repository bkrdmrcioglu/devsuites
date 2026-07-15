import type { Metadata } from "next";
import { getSessionEmail } from "@/lib/session";
import { ensureStore, findLicensesByEmail } from "@/lib/store";
import { LicenseList } from "@/components/LicenseList";

export const metadata: Metadata = {
  title: "Licenses — DevSuites",
  description: "Your DevSuites license keys",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountLicensesPage() {
  const email = await getSessionEmail();
  if (!email) return null;

  let licenses: Awaited<ReturnType<typeof findLicensesByEmail>> = [];
  let loadError: string | null = null;

  try {
    await ensureStore();
    licenses = await findLicensesByEmail(email);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Database unavailable";
  }

  return (
    <div className="account-licenses">
      <div className="account-section-head">
        <h2>My licenses</h2>
        <p>
          Keys tied to <strong>{email}</strong>. See seats in use, copy a key,
          or use your <strong>one-time</strong> device reset if you changed Macs.
        </p>
      </div>
      {loadError ? (
        <p className="portal-error">{loadError}</p>
      ) : (
        <LicenseList licenses={licenses} />
      )}
    </div>
  );
}
