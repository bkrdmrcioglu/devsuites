"use client";

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
  const [copied, setCopied] = useState<string | null>(null);

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  if (licenses.length === 0) {
    return <p className="portal-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="license-list">
      {licenses.map((lic) => (
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
              {[lic.productName, lic.variantName].filter(Boolean).join(" · ")}
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
  );
}
