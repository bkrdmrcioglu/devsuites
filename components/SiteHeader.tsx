"use client";

import { useRouter } from "next/navigation";
import {
  SITE_PORTAL_LINK,
  SITE_PRODUCTS,
  type SitePage,
  downloadHrefFor,
} from "@/lib/siteNav";
import { useEffect, useState } from "react";

type Props = {
  current: SitePage;
  /** Override download target; defaults from page. */
  downloadHref?: string;
  /** Extra CTA on the right. Replaces Download / sign-out when set. */
  trailing?: React.ReactNode;
  /** Signed-in user's email, if any — swaps the login link for account state. */
  email?: string | null;
};

export function SiteHeader({ current, downloadHref, trailing, email }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ctaHref = downloadHref ?? downloadHrefFor(current);

  useEffect(() => {
    setOpen(false);
  }, [current]);

  async function onLogout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <header className="top">
      <div className="top-inner">
        <a className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/mark.png" width={28} height={28} alt="" />
          DevSuites
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
        <nav id="site-nav" className={open ? "open" : undefined}>
          {SITE_PRODUCTS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={current === item.id ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {email ? (
            <a
              href={SITE_PORTAL_LINK.href}
              aria-current={current === "login" ? "page" : undefined}
              onClick={() => setOpen(false)}
              title={email}
            >
              {email}
            </a>
          ) : (
            <a
              href={SITE_PORTAL_LINK.href}
              aria-current={current === "login" ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {SITE_PORTAL_LINK.label}
            </a>
          )}
          {trailing ??
            (email ? (
              <button
                type="button"
                className="nav-cta"
                onClick={onLogout}
                disabled={busy}
              >
                Log out
              </button>
            ) : (
              <a
                href={ctaHref}
                className="nav-cta"
                onClick={() => setOpen(false)}
              >
                Download
              </a>
            ))}
        </nav>
      </div>
    </header>
  );
}
