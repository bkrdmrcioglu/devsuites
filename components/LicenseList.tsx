"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  appLabel,
  statusLabel,
  type LicenseRow,
} from "@/lib/licenseLabels";

type Props = {
  licenses: LicenseRow[];
  emptyMessage?: string;
};

export function LicenseList({
  licenses,
  emptyMessage = "No license keys found for this email yet. After purchase, Lemon sends a key and our webhook stores it here.",
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  async function resetDevices(licenseKey: string) {
    const ok = window.confirm(
      "Reset all devices on this license? This is a one-time action — you cannot reset again from your account."
    );
    if (!ok) return;

    setBusyKey(licenseKey);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/account/licenses/${encodeURIComponent(licenseKey)}/reset-devices`,
        { method: "POST" }
      );
      const data = (await res.json()) as {
        error?: string;
        removed?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "Reset failed");
        return;
      }
      setMessage(
        `Cleared ${data.removed ?? 0} device seat(s). You can activate again on a new Mac.`
      );
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusyKey(null);
    }
  }

  if (licenses.length === 0) {
    return <p className="portal-empty">{emptyMessage}</p>;
  }

  return (
    <div className="license-list-wrap">
      {error ? <p className="portal-error">{error}</p> : null}
      {message ? <p className="portal-ok">{message}</p> : null}
      <ul className="license-list">
        {licenses.map((lic) => {
          const used = lic.activationCount ?? 0;
          const limit = lic.activationLimit ?? 5;
          const resetUsed = Boolean(lic.customerResetAt);
          const canReset = Boolean(lic.licenseKey) && used > 0 && !resetUsed;

          return (
            <li key={lic.id} className="license-card">
              <div className="license-card-top">
                <span className="license-app">
                  {appLabel(lic.app, lic.productName)}
                </span>
                {statusLabel(lic.status) ? (
                  <span className="license-status">
                    {statusLabel(lic.status)}
                  </span>
                ) : null}
              </div>
              {lic.productName || lic.variantName ? (
                <p className="license-meta">
                  {[lic.productName, lic.variantName]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}

              <div className="license-seats">
                <div className="license-seats-text">
                  <strong>
                    {used} / {limit}
                  </strong>{" "}
                  device seats used
                </div>
                <div
                  className="license-seats-bar"
                  role="progressbar"
                  aria-valuenow={used}
                  aria-valuemin={0}
                  aria-valuemax={limit}
                >
                  <span
                    style={{
                      width: `${Math.min(100, (used / Math.max(limit, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

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

              <div className="license-card-foot">
                <p className="license-date">
                  {new Date(lic.receivedAt).toLocaleString()}
                </p>
                {canReset ? (
                  <button
                    type="button"
                    className="btn ghost sm"
                    disabled={busyKey === lic.licenseKey}
                    onClick={() => resetDevices(lic.licenseKey!)}
                  >
                    {busyKey === lic.licenseKey
                      ? "Resetting…"
                      : "Reset devices (once)"}
                  </button>
                ) : resetUsed ? (
                  <span className="license-reset-used">
                    One-time reset used
                    {lic.customerResetAt
                      ? ` · ${new Date(lic.customerResetAt).toLocaleDateString()}`
                      : ""}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
