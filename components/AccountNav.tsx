"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Profile", match: (p: string) => p === "/account" },
  {
    href: "/account/licenses",
    label: "Licenses",
    match: (p: string) => p.startsWith("/account/licenses"),
  },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="account-nav" aria-label="Account">
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
