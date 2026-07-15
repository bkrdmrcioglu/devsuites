import type { Metadata } from "next";
import Link from "next/link";
import { getSessionEmail } from "@/lib/session";
import { ensureStore, findLicensesByEmail } from "@/lib/store";
import { getUserByEmail } from "@/lib/users";

export const metadata: Metadata = {
  title: "Profile — DevSuites",
  description: "Your DevSuites account profile",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const email = await getSessionEmail();
  if (!email) return null;

  let user: Awaited<ReturnType<typeof getUserByEmail>> = null;
  let licenseCount = 0;
  let loadError: string | null = null;

  try {
    await ensureStore();
    user = await getUserByEmail(email);
    const licenses = await findLicensesByEmail(email);
    licenseCount = licenses.length;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Database unavailable";
  }

  const name = user?.name?.trim() || null;
  const avatar = user?.avatarUrl;
  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="account-profile">
      {loadError ? <p className="portal-error">{loadError}</p> : null}

      <div className="account-hero">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="account-hero-avatar"
            src={avatar}
            alt=""
            width={72}
            height={72}
          />
        ) : (
          <div className="account-hero-avatar account-hero-avatar--fallback" aria-hidden>
            {(name || email).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="account-hero-text">
          <h2>{name || "Your profile"}</h2>
          <p>{email}</p>
        </div>
      </div>

      <dl className="account-facts">
        <div>
          <dt>Display name</dt>
          <dd>{name || "—"}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{email}</dd>
        </div>
        <div>
          <dt>Sign-in</dt>
          <dd>
            {[
              user?.githubId ? "GitHub" : null,
              user?.hasPassword ? "Email & password" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{since || "—"}</dd>
        </div>
      </dl>

      <div className="account-stat-row">
        <div className="account-stat">
          <span className="account-stat-value">{licenseCount}</span>
          <span className="account-stat-label">
            {licenseCount === 1 ? "License" : "Licenses"}
          </span>
        </div>
        <Link href="/account/licenses" className="btn primary account-stat-cta">
          View licenses
        </Link>
      </div>
    </div>
  );
}
