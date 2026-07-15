"use client";

import { useState } from "react";

type Props = {
  label: string;
  command: string;
};

export function CopyableCommand({ label, command }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="brew-field">
      <span className="brew-label">{label}</span>
      <div className="brew-row">
        <input type="text" readOnly value={command} />
        <button
          type="button"
          className={copied ? "brew-copy copied" : "brew-copy"}
          onClick={onCopy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
