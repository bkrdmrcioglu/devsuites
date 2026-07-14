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
    title: "Dashboard",
    subtitle: "At a glance suite performance and device seats",
  },
  customers: {
    title: "Customer Directory",
    subtitle: "Users with active license keys",
  },
  licenses: {
    title: "License Management",
    subtitle: "Seat control, resets, and custom limits",
  },
  issue: {
    title: "Issue Key",
    subtitle: "Manually issue a complimentary license",
  },
};

// --- SVG Icons ---
const Icon = {
  Grid: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  Users: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Key: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z" />
    </svg>
  ),
  Plus: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Monitor: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  Logout: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Globe: () => (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20" />
    </svg>
  ),
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
  const [devicesByKey, setDevicesByKey] = useState<Record<string, Device[]>>({});
  const [deviceBusy, setDeviceBusy] = useState(false);
  const [deviceMsg, setDeviceMsg] = useState<string | null>(null);
  const [limitDrafts, setLimitDrafts] = useState<Record<string, number>>({});
  const [navOpen, setNavOpen] = useState(false);

  function goTab(t: Tab) {
    setTab(t);
    setNavOpen(false);
  }

  const filteredLicenses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return licenses;
    return licenses.filter((lic) => {
      const hay = [lic.email, lic.licenseKey, lic.app, lic.productName, lic.note, lic.source, lic.status]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [licenses, query]);

  const totalSeatsUsed = licenses.reduce((sum, lic) => sum + (lic.activationCount ?? 0), 0);
  const fullLicenses = licenses.filter((lic) => (lic.activationCount ?? 0) >= lic.activationLimit).length;

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
        body: JSON.stringify({ email, app, note, activationLimit }),
      });
      const data = (await res.json()) as { error?: string; license?: { licenseKey?: string } };
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
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseKey)}/instances`);
      const data = (await res.json()) as { error?: string; instances?: Device[] };
      if (!res.ok) {
        setDeviceMsg(data.error ?? "Failed to load devices");
        return;
      }
      setDevicesByKey((prev) => ({ ...prev, [licenseKey]: data.instances ?? [] }));
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
    if (!confirm("Remove this device seat?")) return;
    setDeviceBusy(true);
    setDeviceMsg(null);
    try {
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseKey)}/instances/${encodeURIComponent(instanceId)}`, { method: "DELETE" });
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
    if (!confirm("Reset all devices for this license?")) return;
    setDeviceBusy(true);
    setDeviceMsg(null);
    try {
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseKey)}/reset-devices`, { method: "POST" });
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
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseKey)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ activationLimit: next }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setDeviceMsg(data.error ?? "Update failed");
        return;
      }
      setDeviceMsg(`Limit updated.`);
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
            <p>Authentication required</p>
            <form className="admin-form" onSubmit={onLogin}>
              <label>
                Admin Password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </label>
              {error ? <p className="admin-error">{error}</p> : null}
              <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                {busy ? "Authenticating..." : "Login"}
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
      <div className={`admin-shell ${navOpen ? "nav-open" : ""}`}>
        <div className="admin-scrim" onClick={() => setNavOpen(false)} />
        <aside className="admin-aside">
          <div className="admin-aside-brand">
            <img src="/assets/mark.png" alt="" />
            <div>
              <strong>DevSuites</strong>
              <span>Console</span>
            </div>
          </div>

          <nav className="admin-nav">
            <div className="admin-nav-group">
              <span className="admin-nav-label">General</span>
              <button className={tab === "overview" ? "is-active" : ""} onClick={() => goTab("overview")}>
                <Icon.Grid /> <span>Dashboard</span>
              </button>
              <button className={tab === "customers" ? "is-active" : ""} onClick={() => goTab("customers")}>
                <Icon.Users /> <span>Customers</span>
                <span className="admin-nav-count">{customers.length}</span>
              </button>
            </div>

            <div className="admin-nav-group">
              <span className="admin-nav-label">Management</span>
              <button className={tab === "licenses" ? "is-active" : ""} onClick={() => goTab("licenses")}>
                <Icon.Key /> <span>Licenses</span>
                <span className="admin-nav-count">{licenses.length}</span>
              </button>
              <button className={tab === "issue" ? "is-active" : ""} onClick={() => goTab("issue")}>
                <Icon.Plus /> <span>Issue Key</span>
              </button>
            </div>
          </nav>

          <div className="admin-aside-foot">
            <a href="/licenses" target="_blank">
              <Icon.Users /> <span>Portal</span>
            </a>
            <a href="/" target="_blank">
              <Icon.Globe /> <span>Live Site</span>
            </a>
          </div>
        </aside>

        <div className="admin-stage">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button className="admin-topbar-menu" onClick={() => setNavOpen(true)}>
                <span></span>
                <span></span>
                <span></span>
              </button>
              <div>
                <h1>{meta.title}</h1>
                <p>{meta.subtitle}</p>
              </div>
            </div>
            <div className="admin-topbar-actions">
              <button className="admin-btn admin-btn-sm" onClick={onLogout} disabled={busy}>
                <Icon.Logout /> <span>Sign out</span>
              </button>
            </div>
          </header>

          <div className="admin-content">
            {dbError ? <div className="admin-panel" style={{ background: "var(--ad-danger-soft)", borderColor: "var(--ad-danger)", padding: 16 }}>{dbError}</div> : null}

            {tab === "overview" && (
              <>
                <div className="admin-stats">
                  <div className="admin-stat">
                    <span>Active Customers</span>
                    <strong>{customers.length}</strong>
                    <div className="admin-stat-icon"><Icon.Users /></div>
                  </div>
                  <div className="admin-stat">
                    <span>Keys Issued</span>
                    <strong>{licenses.length}</strong>
                    <div className="admin-stat-icon"><Icon.Key /></div>
                  </div>
                  <div className="admin-stat">
                    <span>Device Seats</span>
                    <strong>{totalSeatsUsed}</strong>
                    <div className="admin-stat-icon"><Icon.Monitor /></div>
                  </div>
                  <div className="admin-stat">
                    <span>Full Licenses</span>
                    <strong>{fullLicenses}</strong>
                    <div className="admin-stat-icon" style={{ background: "var(--ad-warn-soft)", color: "var(--ad-warn)" }}><Icon.Plus /></div>
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <div>
                      <h2>Recent Performance</h2>
                      <p>Global seat usage and license status across the suite</p>
                    </div>
                    <button className="admin-btn admin-btn-sm" onClick={() => goTab("licenses")}>
                      Details
                    </button>
                  </div>
                  <div className="admin-panel-body">
                    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem", fontWeight: 600 }}>
                          <span style={{ color: "var(--ad-faint)" }}>Device Pool</span>
                          <span>{totalSeatsUsed} used</span>
                        </div>
                        <div style={{ height: 6, background: "var(--ad-line)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "var(--ad-accent)", width: `${Math.min(100, (totalSeatsUsed / (licenses.length * 5 || 1)) * 100)}%` }} />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem", fontWeight: 600 }}>
                          <span style={{ color: "var(--ad-faint)" }}>Key Saturation</span>
                          <span>{fullLicenses} full</span>
                        </div>
                        <div style={{ height: 6, background: "var(--ad-line)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "var(--ad-warn)", width: `${Math.min(100, (fullLicenses / (licenses.length || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "customers" && (
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h2>Directory</h2>
                  <p>{customers.length} users registered</p>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Customer Email</th>
                        <th>Apps</th>
                        <th>Licenses</th>
                        <th>Latest Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.email}>
                          <td style={{ fontWeight: 600 }}>{c.email}</td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              {c.apps.map(a => <span key={a} className="admin-pill admin-pill-muted" style={{ textTransform: "capitalize" }}>{a}</span>)}
                            </div>
                          </td>
                          <td className="admin-mono" style={{ color: "var(--ad-accent)" }}>{c.licenseCount}</td>
                          <td style={{ color: "var(--ad-faint)", fontSize: "0.8rem" }}>{new Date(c.latestAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "issue" && (
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h2>Issue Complimentary License</h2>
                </div>
                <div className="admin-panel-body">
                  <form className="admin-form" onSubmit={onCreate}>
                    <label>
                      Customer Email
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" />
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <label>
                        Product
                        <select value={app} onChange={(e) => setApp(e.target.value)}>
                          {APPS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                        </select>
                      </label>
                      <label>
                        Seat Limit
                        <input type="number" min={1} max={100} value={activationLimit} onChange={(e) => setActivationLimit(Number(e.target.value) || 1)} />
                      </label>
                    </div>
                    <label>
                      Note
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for complimentary key..." rows={3} />
                    </label>
                    {error && <p className="admin-error">{error}</p>}
                    {createdKey && (
                      <div className="admin-keybox">
                        <code>{createdKey}</code>
                        <button type="button" className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => copyText(createdKey)}>
                          {copied === createdKey ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                    <button type="submit" className="admin-btn admin-btn-primary" style={{ width: "fit-content" }} disabled={busy}>
                      <Icon.Plus /> {busy ? "Issuing..." : "Create License"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {tab === "licenses" && (
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                    <h2>License Registry</h2>
                    <input className="admin-search" style={{ margin: 0, padding: "8px 12px", fontSize: "0.85rem" }} placeholder="Search email, key, note..." value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                </div>

                {deviceMsg && <div style={{ padding: "16px 24px 0" }} className={deviceMsg.includes("fail") ? "admin-error" : "admin-ok"}>{deviceMsg}</div>}

                <div className="admin-license-list">
                  {filteredLicenses.map((lic) => {
                    const key = lic.licenseKey;
                    const used = lic.activationCount ?? 0;
                    const open = key != null && openKey === key;
                    return (
                      <div key={lic.id} className={`admin-license-card ${open ? "is-open" : ""}`}>
                        <div className="admin-license-row">
                          <div>
                            <strong>{appLabel(lic.app, lic.productName)}</strong>
                            <span className="admin-license-sub">{lic.status ?? "Inactive"} · {lic.source} {lic.note && ` · ${lic.note}`}</span>
                          </div>
                          <div className="admin-license-meta">
                            <span>{lic.email}</span>
                            <span className={seatsPill(used, lic.activationLimit)} style={{ width: "fit-content" }}>{used} / {lic.activationLimit} Seats</span>
                          </div>
                          <div className="admin-license-actions">
                            {key && (
                              <button type="button" className="admin-btn admin-btn-sm" onClick={() => copyText(key)}>
                                {copied === key ? "Copied" : "Copy Key"}
                              </button>
                            )}
                            <button type="button" className="admin-btn admin-btn-sm admin-btn-primary" disabled={!key} onClick={() => key && toggleLicense(key)}>
                              {open ? "Hide Seats" : "View Seats"}
                            </button>
                          </div>
                        </div>

                        {open && key && (
                          <div className="admin-devices">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, gap: 20, flexWrap: "wrap" }}>
                              <div>
                                <h3 style={{ margin: "0 0 4px", fontSize: "0.9rem" }}>Hardware Identifiers</h3>
                                <p style={{ margin: 0, color: "var(--ad-faint)", fontSize: "0.8rem" }}>Registered machines for <code>{key}</code></p>
                              </div>
                              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ad-elevated)", padding: "4px 8px", borderRadius: 8, border: "1px solid var(--ad-line)" }}>
                                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Limit:</span>
                                  <input type="number" value={limitDrafts[key] ?? lic.activationLimit} onChange={e => setLimitDrafts(p => ({ ...p, [key]: Number(e.target.value) || 1 }))} style={{ width: 45, background: "transparent", border: "none", color: "inherit", font: "inherit", fontWeight: 700, padding: 0 }} />
                                  <button className="admin-btn admin-btn-sm admin-btn-primary" style={{ padding: "4px 8px" }} disabled={deviceBusy} onClick={() => saveLimit(key)}>Save</button>
                                </div>
                                <button className="admin-btn admin-btn-sm admin-btn-danger" disabled={deviceBusy || used === 0} onClick={() => resetDevices(key)}>Reset All</button>
                              </div>
                            </div>

                            {deviceBusy && !devicesByKey[key] ? (
                              <div className="admin-empty">Syncing...</div>
                            ) : (devicesByKey[key] ?? []).length === 0 ? (
                              <div className="admin-empty">No devices active.</div>
                            ) : (
                              (devicesByKey[key] ?? []).map((d) => (
                                <div className="admin-device" key={d.instanceId}>
                                  <div>
                                    <strong style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon.Monitor /> {d.instanceName || "Unknown Mac"}</strong>
                                    <small>{d.instanceId} · Registered {new Date(d.createdAt).toLocaleDateString()}</small>
                                  </div>
                                  <button className="admin-btn admin-btn-sm admin-btn-danger" style={{ background: "transparent" }} disabled={deviceBusy} onClick={() => removeDevice(key, d.instanceId)}>Revoke Seat</button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <footer className="admin-footer" style={{ padding: "20px 40px", borderTop: "1px solid var(--ad-line)", color: "var(--ad-faint)", fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
            <span>DevSuites Dashboard v2.0</span>
            <span>&copy; 2026 Admin Control</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
