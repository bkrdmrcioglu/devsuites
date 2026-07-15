/** Single source of truth for the public site header nav, consumed by components/SiteHeader.tsx. */

export type SitePage =
  | "home"
  | "devdock"
  | "devmail"
  | "devsql"
  | "devcheck"
  | "login"
  | "admin";

export type SiteNavLink = {
  id: string;
  label: string;
  href: string;
};

export const SITE_PRODUCTS: SiteNavLink[] = [
  { id: "devdock", label: "DevDock", href: "/devdock" },
  { id: "devmail", label: "DevMail", href: "/devmail" },
  { id: "devsql", label: "DevSQL", href: "/devsql" },
  { id: "devcheck", label: "DevCheck", href: "/devcheck" },
];

export const SITE_PORTAL_LINK: SiteNavLink = {
  id: "login",
  label: "Login",
  href: "/login",
};

export function downloadHrefFor(page: SitePage): string {
  if (page === "home" || page === "login" || page === "admin") return "/#apps";
  return "#download";
}
