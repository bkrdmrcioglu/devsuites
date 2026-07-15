import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountNav } from "@/components/AccountNav";
import { getSessionEmail } from "@/lib/session";
import { ensureStore } from "@/lib/store";
import { getUserByEmail } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getSessionEmail();
  if (!email) redirect("/login");

  let displayName: string | null = null;
  try {
    await ensureStore();
    const user = await getUserByEmail(email);
    displayName = user?.name ?? null;
  } catch {
    /* header still works with email */
  }

  return (
    <div className="portal-page">
      <SiteHeader
        current="account"
        email={email}
        displayName={displayName}
      />
      <main className="account-main">
        <div className="account-shell">
          <header className="account-shell-head">
            <p className="account-kicker">Account</p>
            <h1 className="account-title">Your DevSuites space</h1>
          </header>
          <AccountNav />
          <div className="account-body">{children}</div>
        </div>
      </main>
      <footer className="portal-foot">
        DevSuites account · <a href="/">Back to site</a>
      </footer>
    </div>
  );
}
