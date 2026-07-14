"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LicenseRow = {
  id: number;
  receivedAt: string;
  eventName: string;
  orderId: string | null;
  email: string | null;
  productName: string | null;
  variantName: string | null;
  licenseKey: string | null;
  app: string | null;
  status: string | null;
};

type Props = {
  email: string | null;
  licenses: LicenseRow[];
  dbError: string | null;
};

const APP_LABELS: Record<string, string> = {
  devdock: "DevDock",
  devmail: "DevMail",
  devsql: "DevSQL",
  devcheck: "DevCheck",
};

function appLabel(app: string | null, product: string | null): string {
  if (app && APP_LABELS[app]) return APP_LABELS[app];
  if (product) return product;
  return "License";
}

export function LicensesClient({ email, licenses, dbError }: Props) {
  const router = useRouter();
  const [formEmail, setFormEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: formEmail, licenseKey }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />
      <header className="top">
        <a className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/mark.png" width={28} height={28} alt="" />
          DevSuites
        </a>
        <nav>
          <a href="/devdock/">DevDock</a>
          <a href="/devmail/">DevMail</a>
          <a href="/devsql/">DevSQL</a>
          <a href="/devcheck/">DevCheck</a>
          {email ? (
            <button
              type="button"
              className="nav-cta"
              onClick={onLogout}
              disabled={busy}
              style={{
                border: "none",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Sign out
            </button>
          ) : (
            <a href="/#apps" className="nav-cta">
              Download
            </a>
          )}
        </nav>
      </header>

      <main>
        <section className="portal">
          <h1>Licenses</h1>
          {!email ? (
            <>
              <p className="portal-lede">
                Sign in with the email from your Lemon checkout and any one of
                your DevSuites license keys.
              </p>
              <form className="portal-form" onSubmit={onLogin}>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  License key
                  <input
                    type="text"
                    autoComplete="off"
                    required
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    spellCheck={false}
                  />
                </label>
                {error ? <p className="portal-error">{error}</p> : null}
                <button type="submit" className="btn primary" disabled={busy}>
                  {busy ? "Signing in…" : "View licenses"}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="portal-lede">
                Signed in as <strong>{email}</strong>
              </p>
              {dbError ? (
                <p className="portal-error">{dbError}</p>
              ) : licenses.length === 0 ? (
                <p className="portal-empty">
                  No license keys found for this email yet. After purchase,
                  Lemon sends a key and our webhook stores it here.
                </p>
              ) : (
                <ul className="license-list">
                  {licenses.map((lic) => (
                    <li key={lic.id} className="license-card">
                      <div className="license-card-top">
                        <span className="license-app">
                          {appLabel(lic.app, lic.productName)}
                        </span>
                        {lic.status ? (
                          <span className="license-status">{lic.status}</span>
                        ) : null}
                      </div>
                      {lic.productName || lic.variantName ? (
                        <p className="license-meta">
                          {[lic.productName, lic.variantName]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {lic.licenseKey ? (
                        <div className="license-key-row">
                          <code>{lic.licenseKey}</code>
                          <button
                            type="button"
                            className="btn ghost sm"
                            onClick={() => copyKey(lic.licenseKey!)}
                          >
                            {copied === lic.licenseKey ? "Copied" : "Copy"}
                          </button>
                        </div>
                      ) : null}
                      <p className="license-date">
                        {new Date(lic.receivedAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
