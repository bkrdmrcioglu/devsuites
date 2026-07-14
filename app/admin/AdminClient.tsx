"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

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

type Device = {
  instanceId: string;
  instanceName: string | null;
  createdAt: string;
};

type Props = {
  authed: boolean;
  customers: Customer[];
  licenses: LicenseRow[];
  dbError: string | null;
};

type Tab = "overview" | "customers" | "licenses" | "issue";

const APPS = [
  { id: "devdock", label: "DevDock" },
  { id: "devmail", label: "DevMail" },
  { id: "devsql", label: "DevSQL" },
  { id: "devcheck", label: "DevCheck" },
] as const;

const TAB_META: Record<Tab, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "Customers, keys, and device seat usage",
  },
  customers: {
    title: "Customers",
    subtitle: "Purchase emails with at least one license",
  },
  licenses: {
    title: "Licenses",
    subtitle: "Device seats, resets, and activation limits",
  },
  issue: {
    title: "Issue license",
    subtitle: "Create a complimentary DS-… key in Postgres",
  },
};

function appLabel(app: string | null, product: string | null): string {
  if (app) {
    const hit = APPS.find((a) => a.id === app);
    if (hit) return hit.label;
  }
  return product ?? "License";
}

function seatsPill(used: number, limit: number) {
  if (used >= limit) return "admin-pill admin-pill-full";
  if (used === 0) return "admin-pill admin-pill-muted";
  if (used >= Math.max(1, limit - 1)) return "admin-pill admin-pill-warn";
  return "admin-pill admin-pill-ok";
}

function encodeKey(key: string) {
  return encodeURIComponent(key);
}

export function AdminClient({ authed, customers, licenses, dbError }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [app, setApp] = useState("devdock");
  const [note, setNote] = useState("");
  const [activationLimit, setActivationLimit] = useState(5);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [devicesByKey, setDevicesByKey] = useState<Record<string, Device[]>>(
    {}
  );
  const [deviceBusy, setDeviceBusy] = useState(false);
  const [deviceMsg, setDeviceMsg] = useState<string | null>(null);
  const [limitDrafts, setLimitDrafts] = useState<Record<string, number>>({});

  const filteredLicenses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return licenses;
    return licenses.filter((lic) => {
      const hay = [
        lic.email,
        lic.licenseKey,
        lic.app,
        lic.productName,
        lic.note,
        lic.source,
        lic.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [licenses, query]);

  const totalSeatsUsed = licenses.reduce(
    (sum, lic) => sum + (lic.activationCount ?? 0),
    0
  );
  const fullLicenses = licenses.filter(
    (lic) => (lic.activationCount ?? 0) >= lic.activationLimit
  ).length;

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
        body: JSON.stringify({
          email,
          app,
          note,
          activationLimit,
        }),
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

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1400);
  }

  async function loadDevices(licenseKey: string) {
    setDeviceBusy(true);
    setDeviceMsg(null);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeKey(licenseKey)}/instances`
      );
      const data = (await res.json()) as {
        error?: string;
        instances?: Device[];
      };
      if (!res.ok) {
        setDeviceMsg(data.error ?? "Failed to load devices");
        return;
      }
      setDevicesByKey((prev) => ({
        ...prev,
        [licenseKey]: data.instances ?? [],
      }));
    } catch {
      setDeviceMsg("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function toggleLicense(licenseKey: string) {
    if (openKey === licenseKey) {
      setOpenKey(null);
      return;
    }
    setOpenKey(licenseKey);
    if (!devicesByKey[licenseKey]) {
      await loadDevices(licenseKey);
    }
  }

  async function removeDevice(licenseKey: string, instanceId: string) {
    if (!confirm("Remove this device seat? The Mac will need to activate again.")) {
      return;
    }
    setDeviceBusy(true);
    setDeviceMsg(null);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeKey(licenseKey)}/instances/${encodeKey(instanceId)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setDeviceMsg(data.error ?? "Remove failed");
        return;
      }
      await loadDevices(licenseKey);
      router.refresh();
    } catch {
      setDeviceMsg("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function resetDevices(licenseKey: string) {
    if (
      !confirm(
        "Reset all devices for this license? Every machine will need to activate again."
      )
    ) {
      return;
    }
    setDeviceBusy(true);
    setDeviceMsg(null);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeKey(licenseKey)}/reset-devices`,
        { method: "POST" }
      );
      const data = (await res.json()) as { error?: string; removed?: number };
      if (!res.ok) {
        setDeviceMsg(data.error ?? "Reset failed");
        return;
      }
      setDevicesByKey((prev) => ({ ...prev, [licenseKey]: [] }));
      setDeviceMsg(`Cleared ${data.removed ?? 0} device seat(s).`);
      router.refresh();
    } catch {
      setDeviceMsg("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function saveLimit(licenseKey: string) {
    const next = limitDrafts[licenseKey];
    if (next == null) return;
    setDeviceBusy(true);
    setDeviceMsg(null);
    try {
      const res = await fetch(`/api/admin/licenses/${encodeKey(licenseKey)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ activationLimit: next }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setDeviceMsg(data.error ?? "Update failed");
        return;
      }
      setDeviceMsg(`Seat limit set to ${next}.`);
      router.refresh();
    } catch {
      setDeviceMsg("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="admin-root">
        <div className="admin-login">
          <div className="admin-login-card">
            <h1>DevSuites Admin</h1>
            <p>Sign in to manage licenses and device seats.</p>
            <form className="admin-form" onSubmit={onLogin}>
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
              {error ? <p className="admin-error">{error}</p> : null}
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={busy}
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const meta = TAB_META[tab];

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-aside">
          <div className="admin-aside-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/mark.png" alt="" />
            <div>
              <strong>DevSuites</strong>
              <span>License console</span>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin">
            {(
              [
                ["overview", "Overview", null],
                ["customers", "Customers", customers.length],
                ["licenses", "Licenses", licenses.length],
                ["issue", "Issue key", null],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                className={tab === id ? "is-active" : undefined}
                onClick={() => setTab(id)}
              >
                <span>{label}</span>
                {count != null ? (
                  <span className="admin-nav-count">{count}</span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="admin-aside-foot">
            <a href="/licenses">Customer portal</a>
            <a href="/">Marketing site</a>
          </div>
        </aside>

        <div className="admin-stage">
          <header className="admin-topbar">
            <div>
              <h1>{meta.title}</h1>
              <p>{meta.subtitle}</p>
            </div>
            <div className="admin-topbar-actions">
              <span className="admin-badge">Admin</span>
              <button
                type="button"
                className="admin-btn admin-btn-sm"
                onClick={onLogout}
                disabled={busy}
              >
                Sign out
              </button>
            </div>
          </header>

          <div className="admin-content">
            {dbError ? <p className="admin-error">{dbError}</p> : null}

            {tab === "overview" ? (
              <>
                <div className="admin-stats">
                  <div className="admin-stat">
                    <span>Customers</span>
                    <strong>{customers.length}</strong>
                  </div>
                  <div className="admin-stat">
                    <span>Licenses</span>
                    <strong>{licenses.length}</strong>
                  </div>
                  <div className="admin-stat">
                    <span>Active devices</span>
                    <strong>{totalSeatsUsed}</strong>
                  </div>
                  <div className="admin-stat">
                    <span>Full seats</span>
                    <strong>{fullLicenses}</strong>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div>
                      <h2>Device seats</h2>
                      <p>
                        Each activation binds one Mac. When a customer changes
                        machines, clear a seat or reset all from Licenses.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-sm"
                      onClick={() => setTab("licenses")}
                    >
                      Manage licenses
                    </button>
                  </div>
                  <div className="admin-panel-body">
                    <p className="admin-empty" style={{ paddingTop: 0 }}>
                      Default seat limit is <strong>5</strong> devices per key.
                      Comp keys can use a custom limit when issued.
                    </p>
                  </div>
                </div>
              </>
            ) : null}

            {tab === "customers" ? (
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <div>
                    <h2>Customers</h2>
                    <p>{customers.length} email{customers.length === 1 ? "" : "s"}</p>
                  </div>
                </div>
                {customers.length === 0 ? (
                  <p className="admin-empty" style={{ padding: 16 }}>
                    No customers yet.
                  </p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Apps</th>
                          <th>Keys</th>
                          <th>Latest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((c) => (
                          <tr key={c.email}>
                            <td>{c.email}</td>
                            <td>{(c.apps.length ? c.apps : ["—"]).join(", ")}</td>
                            <td className="admin-mono">{c.licenseCount}</td>
                            <td>{new Date(c.latestAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {tab === "issue" ? (
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <div>
                    <h2>Issue complimentary key</h2>
                    <p>
                      Stored in Postgres as source <code>admin</code>. Mac apps
                      fall back to DevSuites activate when Lemon rejects the key.
                    </p>
                  </div>
                </div>
                <div className="admin-panel-body">
                  <form className="admin-form" onSubmit={onCreate}>
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
                    <div className="admin-form-row">
                      <label>
                        App
                        <select
                          value={app}
                          onChange={(e) => setApp(e.target.value)}
                        >
                          {APPS.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Device seats
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={activationLimit}
                          onChange={(e) =>
                            setActivationLimit(Number(e.target.value) || 1)
                          }
                        />
                      </label>
                    </div>
                    <label>
                      Note (optional)
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Comp / beta / support"
                      />
                    </label>
                    {error ? <p className="admin-error">{error}</p> : null}
                    {createdKey ? (
                      <div className="admin-keybox">
                        <code>{createdKey}</code>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => copyText(createdKey)}
                        >
                          {copied === createdKey ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={busy}
                    >
                      {busy ? "Creating…" : "Create license"}
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {tab === "licenses" ? (
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <div>
                    <h2>All licenses</h2>
                    <p>
                      Expand a key to inspect device seats. Reset when a
                      customer changes machines and slots are full.
                    </p>
                  </div>
                  <input
                    className="admin-search"
                    placeholder="Search email, key, app…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {deviceMsg ? (
                  <p
                    className={
                      deviceMsg.toLowerCase().includes("fail") ||
                      deviceMsg.toLowerCase().includes("error")
                        ? "admin-error"
                        : "admin-ok"
                    }
                    style={{ padding: "10px 16px 0" }}
                  >
                    {deviceMsg}
                  </p>
                ) : null}

                {filteredLicenses.length === 0 ? (
                  <p className="admin-empty" style={{ padding: 16 }}>
                    No licenses match.
                  </p>
                ) : (
                  <div className="admin-license-list">
                    {filteredLicenses.map((lic) => {
                      const key = lic.licenseKey;
                      const used = lic.activationCount ?? 0;
                      const open = key != null && openKey === key;
                      return (
                        <article
                          key={lic.id}
                          className={
                            open
                              ? "admin-license-card is-open"
                              : "admin-license-card"
                          }
                        >
                          <div className="admin-license-row">
                            <div>
                              <strong>
                                {appLabel(lic.app, lic.productName)}
                              </strong>
                              <span className="admin-license-sub">
                                {lic.status ?? "—"} · {lic.source}
                                {lic.note ? ` · ${lic.note}` : ""}
                              </span>
                            </div>
                            <div className="admin-license-meta">
                              <span>{lic.email ?? "—"}</span>
                              <span
                                className={seatsPill(used, lic.activationLimit)}
                              >
                                {used}/{lic.activationLimit} seats
                              </span>
                            </div>
                            <div className="admin-license-actions">
                              {key ? (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-sm"
                                  onClick={() => copyText(key)}
                                >
                                  {copied === key ? "Copied" : "Copy key"}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="admin-btn admin-btn-sm admin-btn-primary"
                                disabled={!key}
                                onClick={() => key && toggleLicense(key)}
                              >
                                {open ? "Hide devices" : "Devices"}
                              </button>
                            </div>
                          </div>

                          {open && key ? (
                            <div className="admin-devices">
                              <div className="admin-devices-head">
                                <div>
                                  <strong>Registered devices</strong>
                                  <span>
                                    {" "}
                                    · seat limit{" "}
                                    <span className="admin-limit-edit">
                                      <input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={
                                          limitDrafts[key] ??
                                          lic.activationLimit
                                        }
                                        onChange={(e) =>
                                          setLimitDrafts((prev) => ({
                                            ...prev,
                                            [key]:
                                              Number(e.target.value) || 1,
                                          }))
                                        }
                                      />
                                      <button
                                        type="button"
                                        className="admin-btn admin-btn-sm"
                                        disabled={deviceBusy}
                                        onClick={() => saveLimit(key)}
                                      >
                                        Save
                                      </button>
                                    </span>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-sm admin-btn-danger"
                                  disabled={deviceBusy || used === 0}
                                  onClick={() => resetDevices(key)}
                                >
                                  Reset all devices
                                </button>
                              </div>

                              {key ? (
                                <div className="admin-keybox" style={{ marginBottom: 12 }}>
                                  <code>{key}</code>
                                </div>
                              ) : null}

                              {deviceBusy && !devicesByKey[key] ? (
                                <p className="admin-empty">Loading…</p>
                              ) : (devicesByKey[key] ?? []).length === 0 ? (
                                <p className="admin-empty">
                                  No devices activated yet.
                                </p>
                              ) : (
                                (devicesByKey[key] ?? []).map((d) => (
                                  <div
                                    className="admin-device"
                                    key={d.instanceId}
                                  >
                                    <div>
                                      <strong>
                                        {d.instanceName || "Mac"}
                                      </strong>
                                      <small>
                                        {d.instanceId} ·{" "}
                                        {new Date(
                                          d.createdAt
                                        ).toLocaleString()}
                                      </small>
                                    </div>
                                    <button
                                      type="button"
                                      className="admin-btn admin-btn-sm"
                                      disabled={deviceBusy}
                                      onClick={() =>
                                        removeDevice(key, d.instanceId)
                                      }
                                    >
                                      Remove seat
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <footer className="admin-footer">
            <span>DevSuites license console</span>
            <span>
              Device seats · reset on hardware change · complimentary keys
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
