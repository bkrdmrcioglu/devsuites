"use client";

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
  /** Extra CTA on the right (e.g. Sign out). Replaces Download when set. */
  trailing?: React.ReactNode;
};

export function SiteHeader({ current, downloadHref, trailing }: Props) {
  const [open, setOpen] = useState(false);
  const ctaHref = downloadHref ?? downloadHrefFor(current);

  useEffect(() => {
    setOpen(false);
  }, [current]);

  return (
    <header className="top">
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
        <a
          href={SITE_PORTAL_LINK.href}
          aria-current={current === "licenses" ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          {SITE_PORTAL_LINK.label}
        </a>
        {trailing ?? (
          <a href={ctaHref} className="nav-cta" onClick={() => setOpen(false)}>
            Download
          </a>
        )}
      </nav>
    </header>
  );
}
