"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LicenseRow = {
  id: number;
  receivedAt: string;
  email: string | null;
  productName: string | null;
  licenseKey: string | null;
  app: string | null;
  status: string | null;
  source: string;
  activationLimit: number;
  note: string | null;
  activationCount?: number;
};

type Customer = {
  email: string;
  licenseCount: number;
  apps: string[];
  latestAt: string;
};

type Props = {
  authed: boolean;
  customers: Customer[];
  licenses: LicenseRow[];
  dbError: string | null;
};

const APPS = [
  { id: "devdock", label: "DevDock" },
  { id: "devmail", label: "DevMail" },
  { id: "devsql", label: "DevSQL" },
  { id: "devcheck", label: "DevCheck" },
] as const;

export function AdminClient({ authed, customers, licenses, dbError }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [app, setApp] = useState<string>("devdock");
  const [note, setNote] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
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
    await fetch("/api/admin/logout", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setCreatedKey(null);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, app, note }),
      });
      const data = (await res.json()) as {
        error?: string;
        license?: { licenseKey?: string };
      };
      if (!res.ok) {
        setError(data.error ?? "Create failed");
        return;
      }
      setCreatedKey(data.license?.licenseKey ?? null);
      setNote("");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function copyKey(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />
      <header className="top">
        <a className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/mark.png" width={28} height={28} alt="" />
          DevSuites Admin
        </a>
        <nav>
          <a href="/licenses">Licenses</a>
          {authed ? (
            <button
              type="button"
              className="nav-cta"
              onClick={onLogout}
              disabled={busy}
              style={{ border: "none", cursor: "pointer", font: "inherit" }}
            >
              Sign out
            </button>
          ) : null}
        </nav>
      </header>

      <main>
        <section className="portal admin-portal">
          <h1>Admin</h1>
          {!authed ? (
            <>
              <p className="portal-lede">
                Sign in with your admin password to see customers and issue
                complimentary licenses.
              </p>
              <form className="portal-form" onSubmit={onLogin}>
                <label>
                  Password
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                {error ? <p className="portal-error">{error}</p> : null}
                <button type="submit" className="btn primary" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </>
          ) : (
            <>
              {dbError ? <p className="portal-error">{dbError}</p> : null}

              <h2 className="admin-h2">Issue license</h2>
              <p className="portal-lede">
                Creates a <code>DS-…</code> key stored in Postgres. Mac apps
                activate it via DevSuites when Lemon does not recognize the key.
              </p>
              <form className="portal-form" onSubmit={onCreate}>
                <label>
                  Customer email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </label>
                <label>
                  App
                  <select
                    value={app}
                    onChange={(e) => setApp(e.target.value)}
                    className="admin-select"
                  >
                    {APPS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Note (optional)
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Comp / beta / support"
                  />
                </label>
                {error ? <p className="portal-error">{error}</p> : null}
                {createdKey ? (
                  <div className="license-key-row">
                    <code>{createdKey}</code>
                    <button
                      type="button"
                      className="btn ghost sm"
                      onClick={() => copyKey(createdKey)}
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                ) : null}
                <button type="submit" className="btn primary" disabled={busy}>
                  {busy ? "Creating…" : "Create license"}
                </button>
              </form>

              <h2 className="admin-h2">Customers ({customers.length})</h2>
              {customers.length === 0 ? (
                <p className="portal-empty">No customers yet.</p>
              ) : (
                <ul className="license-list">
                  {customers.map((c) => (
                    <li key={c.email} className="license-card">
                      <div className="license-card-top">
                        <span className="license-app">{c.email}</span>
                        <span className="license-status">
                          {c.licenseCount} key{c.licenseCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="license-meta">
                        {(c.apps.length ? c.apps : ["—"]).join(" · ")}
                      </p>
                      <p className="license-date">
                        Latest {new Date(c.latestAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <h2 className="admin-h2">All licenses ({licenses.length})</h2>
              <ul className="license-list">
                {licenses.map((lic) => (
                  <li key={lic.id} className="license-card">
                    <div className="license-card-top">
                      <span className="license-app">
                        {lic.app ?? lic.productName ?? "License"}
                      </span>
                      <span className="license-status">
                        {lic.source}/{lic.status ?? "—"}
                      </span>
                    </div>
                    <p className="license-meta">{lic.email ?? "—"}</p>
                    {lic.licenseKey ? (
                      <div className="license-key-row">
                        <code>{lic.licenseKey}</code>
                        <button
                          type="button"
                          className="btn ghost sm"
                          onClick={() => copyKey(lic.licenseKey!)}
                        >
                          Copy
                        </button>
                      </div>
                    ) : null}
                    <p className="license-date">
                      Activations {lic.activationCount ?? 0}/
                      {lic.activationLimit}
                      {lic.note ? ` · ${lic.note}` : ""}
                      {" · "}
                      {new Date(lic.receivedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </>
  );
}
