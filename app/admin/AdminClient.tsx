"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  Plus,
  Monitor,
  LogOut,
  Globe,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Trash2,
  Menu,
  AlertTriangle,
  ExternalLink,
  Gauge,
  ArrowUpRight,
  Ban,
  RotateCcw,
} from "lucide-react";
import { adminLogout } from "./actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
    title: "Panel",
    subtitle: "Overview of licenses and device seats",
  },
  customers: {
    title: "Customers",
    subtitle: "Accounts with purchased or issued licenses",
  },
  licenses: {
    title: "Licenses",
    subtitle: "Keys, seat limits, and registered hardware",
  },
  issue: {
    title: "Issue license",
    subtitle: "Complimentary keys for support and partners",
  },
};

function appLabel(app: string | null, product: string | null): string {
  if (app) {
    const hit = APPS.find((a) => a.id === app);
    if (hit) return hit.label;
  }
  return product ?? "License";
}

function statusLabel(status: string | null): string {
  if (status === "active") return "Active";
  if (status === "disabled") return "Cancelled";
  return "Inactive";
}

function seatTone(used: number, limit: number) {
  if (used >= limit) return "full";
  if (used === 0) return "empty";
  if (used >= Math.max(1, limit - 1)) return "warn";
  return "ok";
}

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors",
        active
          ? "bg-[#2ed68c]/[0.12] text-[#eef6f1]"
          : "text-[rgba(210,222,216,0.6)] hover:bg-white/[0.05] hover:text-[rgba(238,246,241,0.92)]"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          active ? "text-[#2ed68c]" : "text-[rgba(210,222,216,0.45)]"
        )}
      />
      <span className="flex-1">{label}</span>
      {count != null ? (
        <span
          className={cn(
            "font-mono text-[11px] tabular-nums",
            active ? "text-[#2ed68c]" : "text-[rgba(210,222,216,0.3)]"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function SidebarNav({
  tab,
  goTab,
  customers,
  licenses,
}: {
  tab: Tab;
  goTab: (t: Tab) => void;
  customers: Customer[];
  licenses: LicenseRow[];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/mark.png"
          alt=""
          width={26}
          height={26}
          className="rounded-md"
        />
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-[#eef6f1]">
            DevSuites
          </div>
          <div className="text-[11px] text-[rgba(210,222,216,0.4)]">Ops</div>
        </div>
      </div>

      <div
        role="navigation"
        aria-label="Admin sections"
        className="flex flex-1 flex-col items-stretch space-y-1 px-3"
      >
        <NavButton
          active={tab === "overview"}
          onClick={() => goTab("overview")}
          icon={LayoutDashboard}
          label="Panel"
        />
        <NavButton
          active={tab === "customers"}
          onClick={() => goTab("customers")}
          icon={Users}
          label="Customers"
          count={customers.length}
        />
        <NavButton
          active={tab === "licenses"}
          onClick={() => goTab("licenses")}
          icon={KeyRound}
          label="Licenses"
          count={licenses.length}
        />
        <NavButton
          active={tab === "issue"}
          onClick={() => goTab("issue")}
          icon={Plus}
          label="Issue license"
        />
      </div>

      <div className="space-y-0.5 border-t border-white/[0.06] px-3 py-4">
        <a
          href="/login"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] text-[rgba(210,222,216,0.45)] transition-colors hover:bg-white/[0.05] hover:text-[rgba(238,246,241,0.85)]"
        >
          <Users className="size-3.5 opacity-60" />
          <span className="flex-1">Customer portal</span>
          <ExternalLink className="size-3 opacity-40" />
        </a>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] text-[rgba(210,222,216,0.45)] transition-colors hover:bg-white/[0.05] hover:text-[rgba(238,246,241,0.85)]"
        >
          <Globe className="size-3.5 opacity-60" />
          <span className="flex-1">Live site</span>
          <ExternalLink className="size-3 opacity-40" />
        </a>
      </div>
    </div>
  );
}

function CapacityBar({
  label,
  value,
  detail,
  pct,
  tone = "mint",
}: {
  label: string;
  value: string;
  detail: string;
  pct: number;
  tone?: "mint" | "amber";
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-[#0c1014]">{label}</span>
        <span className="font-mono text-[12px] tabular-nums text-[#6b7280]">
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#ecece8]">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            tone === "mint" ? "bg-[#2ed68c]" : "bg-[#d4a017]"
          )}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className="text-[12px] leading-relaxed text-[#8b919a]">{detail}</p>
    </div>
  );
}

export function AdminClient({ customers, licenses, dbError }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [app, setApp] = useState("devdock");
  const [note, setNote] = useState("");
  const [activationLimit, setActivationLimit] = useState(5);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [devicesByKey, setDevicesByKey] = useState<Record<string, Device[]>>(
    {}
  );
  const [deviceBusy, setDeviceBusy] = useState(false);
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

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const hay = [c.email, ...c.apps].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [customers, customerQuery]);

  const recentLicenses = useMemo(
    () =>
      [...licenses]
        .sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
        )
        .slice(0, 6),
    [licenses]
  );

  const totalSeatsUsed = licenses.reduce(
    (sum, lic) => sum + (lic.activationCount ?? 0),
    0
  );
  const fullLicenses = licenses.filter(
    (lic) => (lic.activationCount ?? 0) >= lic.activationLimit
  ).length;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setCreatedKey(null);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, app, note, activationLimit }),
      });
      const data = (await res.json()) as {
        error?: string;
        license?: { licenseKey?: string };
      };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create");
        return;
      }
      setCreatedKey(data.license?.licenseKey ?? null);
      setNote("");
      toast.success("License created");
      router.refresh();
    } catch {
      toast.error("Network error");
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
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeURIComponent(licenseKey)}/instances`
      );
      const data = (await res.json()) as {
        error?: string;
        instances?: Device[];
      };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load devices");
        return;
      }
      setDevicesByKey((prev) => ({
        ...prev,
        [licenseKey]: data.instances ?? [],
      }));
    } catch {
      toast.error("Network error");
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
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeURIComponent(licenseKey)}/instances/${encodeURIComponent(instanceId)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to remove");
        return;
      }
      await loadDevices(licenseKey);
      toast.success("Device seat removed");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function resetDevices(licenseKey: string) {
    if (!confirm("Reset all devices for this license?")) return;
    setDeviceBusy(true);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeURIComponent(licenseKey)}/reset-devices`,
        { method: "POST" }
      );
      const data = (await res.json()) as { error?: string; removed?: number };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to reset");
        return;
      }
      setDevicesByKey((prev) => ({ ...prev, [licenseKey]: [] }));
      toast.success(`${data.removed ?? 0} device seat(s) cleared`);
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function saveLimit(licenseKey: string) {
    const next = limitDrafts[licenseKey];
    if (next == null) return;
    setDeviceBusy(true);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeURIComponent(licenseKey)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ activationLimit: next }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update");
        return;
      }
      toast.success("Limit updated");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function toggleStatus(licenseKey: string, currentStatus: string | null) {
    const nextStatus = currentStatus === "disabled" ? "active" : "disabled";
    setDeviceBusy(true);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeURIComponent(licenseKey)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update");
        return;
      }
      toast.success(
        nextStatus === "disabled"
          ? "License cancelled"
          : "License reactivated"
      );
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  async function removeLicense(licenseKey: string) {
    if (
      !confirm(
        "Permanently delete this license? Device seats will also be removed."
      )
    )
      return;
    setDeviceBusy(true);
    try {
      const res = await fetch(
        `/api/admin/licenses/${encodeURIComponent(licenseKey)}`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete");
        return;
      }
      if (openKey === licenseKey) setOpenKey(null);
      toast.success("License deleted");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setDeviceBusy(false);
    }
  }

  const meta = TAB_META[tab];
  const poolPct = Math.min(
    100,
    (totalSeatsUsed / (licenses.length * 5 || 1)) * 100
  );
  const fullPct = Math.min(100, (fullLicenses / (licenses.length || 1)) * 100);

  const inputClass =
    "h-10 rounded-md border-[#e5e5e0] bg-white shadow-none focus-visible:border-[#2ed68c] focus-visible:ring-[#2ed68c]/20";

  return (
    <div className="min-h-svh bg-[#f7f7f5] text-[#0c1014]">
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="w-[260px] border-0 bg-[#0c1014] p-0 text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Admin menu</SheetTitle>
          </SheetHeader>
          <SidebarNav
            tab={tab}
            goTab={goTab}
            customers={customers}
            licenses={licenses}
          />
        </SheetContent>
      </Sheet>

      <div className="lg:grid lg:min-h-svh lg:grid-cols-[240px_1fr]">
        <aside className="hidden bg-[#0c1014] lg:block">
          <div className="sticky top-0 h-svh">
            <SidebarNav
              tab={tab}
              goTab={goTab}
              customers={customers}
              licenses={licenses}
            />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#ebebe7] bg-[#f7f7f5]/90 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-[#e5e5e0] bg-white lg:hidden"
                  onClick={() => setNavOpen(true)}
                >
                  <Menu className="size-4" />
                </Button>
                <div className="min-w-0">
                  <h1 className="truncate text-[17px] font-semibold tracking-tight text-[#0c1014]">
                    {meta.title}
                  </h1>
                  <p className="truncate text-[13px] text-[#8b919a]">
                    {meta.subtitle}
                  </p>
                </div>
              </div>
              <form action={adminLogout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-[#6b7280] hover:bg-white hover:text-[#0c1014]"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              </form>
            </div>
          </header>

          <div
            role="main"
            className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-7 sm:px-7 lg:px-10"
          >
            {dbError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="size-4" />
                <AlertTitle>Database error</AlertTitle>
                <AlertDescription>{dbError}</AlertDescription>
              </Alert>
            ) : null}

            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-px overflow-hidden rounded-xl border border-[#ebebe7] bg-[#ebebe7] sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Customers",
                      value: customers.length,
                      icon: Users,
                    },
                    {
                      label: "Licenses",
                      value: licenses.length,
                      icon: KeyRound,
                    },
                    {
                      label: "Device seats",
                      value: totalSeatsUsed,
                      icon: Monitor,
                    },
                    {
                      label: "At capacity",
                      value: fullLicenses,
                      icon: Gauge,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white px-5 py-5 sm:px-6 sm:py-6"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] font-medium text-[#8b919a]">
                          {stat.label}
                        </p>
                        <span className="flex size-7 items-center justify-center rounded-md bg-[#f4f4f1]">
                          <stat.icon className="size-3.5 text-[#6b7280]" />
                        </span>
                      </div>
                      <p className="mt-3 font-mono text-[28px] leading-none font-medium tracking-tight tabular-nums text-[#0c1014]">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-xl border border-[#ebebe7] bg-white">
                    <div className="flex items-start justify-between gap-4 border-b border-[#f0f0ec] px-5 py-4 sm:px-6">
                      <div>
                        <h2 className="text-[15px] font-semibold text-[#0c1014]">
                          Capacity
                        </h2>
                        <p className="mt-0.5 text-[13px] text-[#8b919a]">
                          Seat pool and full licenses
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#e5e5e0] bg-white"
                        onClick={() => goTab("licenses")}
                      >
                        Open records
                      </Button>
                    </div>
                    <div className="grid gap-8 px-5 py-6 sm:px-6 sm:grid-cols-2">
                      <CapacityBar
                        label="Device pool"
                        value={`${totalSeatsUsed} in use`}
                        detail="Usage relative to an average of 5 seats per license."
                        pct={poolPct}
                      />
                      <CapacityBar
                        label="Full licenses"
                        value={`${fullLicenses} at max`}
                        detail="Licenses with no activation seats left."
                        pct={fullPct}
                        tone="amber"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col rounded-xl border border-[#ebebe7] bg-white">
                    <div className="flex items-start justify-between gap-4 border-b border-[#f0f0ec] px-5 py-4 sm:px-6">
                      <div>
                        <h2 className="text-[15px] font-semibold text-[#0c1014]">
                          Recent licenses
                        </h2>
                        <p className="mt-0.5 text-[13px] text-[#8b919a]">
                          Most recently created or activated keys
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[#6b7280] hover:bg-[#f4f4f1]"
                        onClick={() => goTab("licenses")}
                      >
                        View all
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </div>
                    <div className="flex-1 divide-y divide-[#f0f0ec]">
                      {recentLicenses.length === 0 ? (
                        <p className="px-5 py-10 text-center text-[13px] text-[#8b919a] sm:px-6">
                          No licenses yet.
                        </p>
                      ) : (
                        recentLicenses.map((lic) => (
                          <div
                            key={lic.id}
                            className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-[#0c1014]">
                                {lic.email ?? "—"}
                              </p>
                              <p className="truncate text-[12px] text-[#8b919a]">
                                {appLabel(lic.app, lic.productName)} ·{" "}
                                {new Date(lic.receivedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded px-2 py-0.5 text-[11px] font-medium capitalize",
                                lic.status === "active"
                                  ? "bg-[#e8f8ef] text-[#0d5c2e]"
                                  : "bg-[#f4f4f1] text-[#6b7280]"
                              )}
                            >
                              {statusLabel(lic.status)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "customers" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border border-[#ebebe7] bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9ca3af]" />
                    <Input
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      placeholder="Search email or app…"
                      className={cn(inputClass, "pl-9")}
                    />
                  </div>
                  <span className="w-fit font-mono text-[12px] tabular-nums text-[#8b919a]">
                    {filteredCustomers.length} results
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#ebebe7] bg-white">
                  <div className="border-b border-[#f0f0ec] px-5 py-4 sm:px-6">
                    <h2 className="text-[15px] font-semibold">
                      Customer directory
                    </h2>
                    <p className="mt-0.5 text-[13px] text-[#8b919a]">
                      {customers.length} registered
                      {customers.length === 1 ? " customer" : " customers"}
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#f0f0ec] hover:bg-transparent">
                        <TableHead className="text-[#8b919a]">
                          Email
                        </TableHead>
                        <TableHead className="text-[#8b919a]">
                          Uygulamalar
                        </TableHead>
                        <TableHead className="text-center text-[#8b919a]">
                          Anahtarlar
                        </TableHead>
                        <TableHead className="text-right text-[#8b919a]">
                          Last activity
                        </TableHead>
                        <TableHead className="text-right text-[#8b919a]">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-12 text-center text-[#8b919a]"
                          >
                            {customers.length === 0
                              ? "No customers yet."
                              : "No customers match your search."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((c) => (
                          <TableRow key={c.email} className="border-[#f0f0ec]">
                            <TableCell className="font-medium">
                              {c.email}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1.5">
                                {c.apps.map((a) => (
                                  <span
                                    key={a}
                                    className="rounded bg-[#f4f4f1] px-2 py-0.5 text-[11px] font-medium capitalize text-[#4b5563]"
                                  >
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono tabular-nums text-[#4b5563]">
                              {c.licenseCount}
                            </TableCell>
                            <TableCell className="text-right text-[#8b919a]">
                              {new Date(c.latestAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-[#e5e5e0] bg-white"
                                onClick={() => {
                                  setQuery(c.email);
                                  goTab("licenses");
                                }}
                              >
                                View licenses
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {tab === "issue" && (
              <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="overflow-hidden rounded-xl border border-[#ebebe7] bg-white">
                  <div className="border-b border-[#f0f0ec] px-6 py-5 sm:px-8">
                    <h2 className="text-[16px] font-semibold">
                      Issue complimentary license
                    </h2>
                    <p className="mt-0.5 text-[13px] text-[#8b919a]">
                      For beta testers, reviewers, refunds, and
                      support requests.
                    </p>
                  </div>
                  <form
                    onSubmit={onCreate}
                    className="space-y-6 px-6 py-6 sm:px-8"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="issue-email"
                        className="text-[13px] text-[#374151]"
                      >
                        Customer email
                      </Label>
                      <Input
                        id="issue-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="issue-app"
                          className="text-[13px] text-[#374151]"
                        >
                          Product
                        </Label>
                        <select
                          id="issue-app"
                          value={app}
                          onChange={(e) => setApp(e.target.value)}
                          className={cn(
                            inputClass,
                            "w-full border px-2.5 text-sm outline-none focus-visible:ring-3"
                          )}
                        >
                          {APPS.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="issue-limit"
                          className="text-[13px] text-[#374151]"
                        >
                          Seat limit
                        </Label>
                        <Input
                          id="issue-limit"
                          type="number"
                          min={1}
                          max={100}
                          value={activationLimit}
                          onChange={(e) =>
                            setActivationLimit(Number(e.target.value) || 1)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="issue-note"
                        className="text-[13px] text-[#374151]"
                      >
                        Internal note
                      </Label>
                      <Textarea
                        id="issue-note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Reason for complimentary key…"
                        rows={3}
                        className="rounded-md border-[#e5e5e0] bg-white shadow-none focus-visible:border-[#2ed68c] focus-visible:ring-[#2ed68c]/20"
                      />
                    </div>

                    {createdKey ? (
                      <Alert className="border-[#b8ecc9] bg-[#f0faf4]">
                        <AlertTitle className="text-[#0d5c2e]">
                          License created
                        </AlertTitle>
                        <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                          <code className="rounded border border-[#c5e8d2] bg-white px-2 py-1 font-mono text-[13px] text-[#0d5c2e]">
                            {createdKey}
                          </code>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-[#e5e5e0]"
                            onClick={() => copyText(createdKey)}
                          >
                            {copied === createdKey ? (
                              <Check className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                            {copied === createdKey ? "Copied" : "Copy"}
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={busy}
                      className="h-10 bg-[#0c1014] text-white hover:bg-[#161b22]"
                    >
                      <Plus className="size-4" />
                      {busy ? "Creating…" : "Issue license"}
                    </Button>
                  </form>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="rounded-xl border border-[#ebebe7] bg-white p-6">
                    <p className="text-[11px] font-medium tracking-[0.12em] text-[#8b919a] uppercase">
                      Preview
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-[#f4f4f1]">
                        <KeyRound className="size-4.5 text-[#6b7280]" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-[#0c1014]">
                          {appLabel(app, null)}
                        </p>
                        <p className="truncate text-[12px] text-[#8b919a]">
                          {email.trim() || "customer@example.com"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-md bg-[#f4f4f1] px-3 py-2 text-[12px]">
                      <span className="text-[#6b7280]">Seat limit</span>
                      <span className="font-mono font-medium tabular-nums text-[#0c1014]">
                        {activationLimit}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#ebebe7] bg-white p-6">
                    <h3 className="text-[13px] font-semibold text-[#0c1014]">
                      How it works
                    </h3>
                    <ul className="mt-3 space-y-3 text-[13px] leading-relaxed text-[#6b7280]">
                      <li className="flex gap-2.5">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#2ed68c]" />
                        The key is created immediately and added to
                        customer-specific tracking.
                      </li>
                      <li className="flex gap-2.5">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#2ed68c]" />
                        Seat limit can be changed later from the Licenses
                        tab.
                      </li>
                      <li className="flex gap-2.5">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#2ed68c]" />
                        Internal note is visible only in the admin panel,
                        not to the customer.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {tab === "licenses" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-xl border border-[#ebebe7] bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9ca3af]" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search email, key, note, or app…"
                      className={cn(inputClass, "pl-9")}
                    />
                  </div>
                  <span className="w-fit font-mono text-[12px] tabular-nums text-[#8b919a]">
                    {filteredLicenses.length} results
                  </span>
                </div>

                <div className="space-y-2.5">
                  {filteredLicenses.length === 0 ? (
                    <div className="rounded-xl border border-[#ebebe7] bg-white py-14 text-center text-[13px] text-[#8b919a]">
                      No licenses match your search.
                    </div>
                  ) : (
                    filteredLicenses.map((lic) => {
                      const key = lic.licenseKey;
                      const used = lic.activationCount ?? 0;
                      const open = key != null && openKey === key;
                      const tone = seatTone(used, lic.activationLimit);
                      return (
                        <div
                          key={lic.id}
                          className={cn(
                            "overflow-hidden rounded-xl border bg-white transition-colors",
                            open
                              ? "border-[#0c1014]/20"
                              : "border-[#ebebe7]"
                          )}
                        >
                          <div className="space-y-4 px-4 py-4 sm:px-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="rounded bg-[#f4f4f1] px-2 py-0.5 text-[11px] font-semibold text-[#374151]">
                                    {appLabel(lic.app, lic.productName)}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded px-2 py-0.5 text-[11px] font-medium capitalize",
                                      lic.status === "active" &&
                                        "bg-[#e8f8ef] text-[#0d5c2e]",
                                      lic.status === "disabled" &&
                                        "bg-red-50 text-red-700",
                                      lic.status !== "active" &&
                                        lic.status !== "disabled" &&
                                        "bg-[#f4f4f1] text-[#6b7280]"
                                    )}
                                  >
                                    {statusLabel(lic.status)}
                                  </span>
                                  <span
                                    className={cn(
                                      "rounded-md px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums",
                                      tone === "full" &&
                                        "bg-red-50 text-red-700",
                                      tone === "warn" &&
                                        "bg-amber-50 text-amber-800",
                                      tone === "empty" &&
                                        "bg-[#f4f4f1] text-[#6b7280]",
                                      tone === "ok" &&
                                        "bg-[#e8f8ef] text-[#0d5c2e]"
                                    )}
                                  >
                                    {used}/{lic.activationLimit} seats
                                  </span>
                                </div>
                                <div className="truncate text-[14px] font-medium">
                                  {lic.email}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#8b919a]">
                                  {key ? (
                                    <code className="rounded bg-[#f4f4f1] px-1.5 py-0.5 font-mono text-[11px] text-[#4b5563]">
                                      {key}
                                    </code>
                                  ) : null}
                                  <span className="text-[#a1a1aa]">
                                    {lic.source}
                                  </span>
                                  {lic.note ? (
                                    <>
                                      <span className="text-[#d4d4d8]">·</span>
                                      <span className="truncate italic">
                                        {lic.note}
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                {key ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-[#e5e5e0] bg-white"
                                    onClick={() => copyText(key)}
                                  >
                                    {copied === key ? (
                                      <Check className="size-4" />
                                    ) : (
                                      <Copy className="size-4" />
                                    )}
                                    Copy
                                  </Button>
                                ) : null}
                                {key ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={deviceBusy}
                                    className="border-[#e5e5e0] bg-white"
                                    onClick={() => toggleStatus(key, lic.status)}
                                  >
                                    {lic.status === "disabled" ? (
                                      <>
                                        <RotateCcw className="size-4" />
                                        Reactivate
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="size-4" />
                                        Cancel
                                      </>
                                    )}
                                  </Button>
                                ) : null}
                                {key ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={deviceBusy}
                                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    onClick={() => removeLicense(key)}
                                    aria-label="Delete license"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={!key}
                                  className="bg-[#0c1014] text-white hover:bg-[#161b22]"
                                  onClick={() => key && toggleLicense(key)}
                                >
                                  {open ? "Hide seats" : "Manage seats"}
                                  {open ? (
                                    <ChevronDown className="size-4" />
                                  ) : (
                                    <ChevronRight className="size-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            {open && key ? (
                              <div className="space-y-4 border-t border-[#f0f0ec] pt-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#0c1014]">
                                    <Monitor className="size-4 text-[#8b919a]" />
                                    Registered devices
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1.5 rounded-md border border-[#e5e5e0] bg-[#fafaf8] py-1 pr-1 pl-2.5">
                                      <span className="text-[11px] font-medium text-[#8b919a]">
                                        Limit
                                      </span>
                                      <Input
                                        type="number"
                                        className="h-7 w-14 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                                        value={
                                          limitDrafts[key] ??
                                          lic.activationLimit
                                        }
                                        onChange={(e) =>
                                          setLimitDrafts((p) => ({
                                            ...p,
                                            [key]:
                                              Number(e.target.value) || 1,
                                          }))
                                        }
                                      />
                                      <Button
                                        type="button"
                                        size="xs"
                                        className="bg-[#0c1014] text-white hover:bg-[#161b22]"
                                        disabled={deviceBusy}
                                        onClick={() => saveLimit(key)}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      disabled={deviceBusy || used === 0}
                                      onClick={() => resetDevices(key)}
                                    >
                                      Reset all
                                    </Button>
                                  </div>
                                </div>

                                {deviceBusy && !devicesByKey[key] ? (
                                  <p className="py-6 text-center text-[13px] text-[#8b919a]">
                                    Loading devices…
                                  </p>
                                ) : (devicesByKey[key] ?? []).length === 0 ? (
                                  <p className="rounded-md border border-dashed border-[#e5e5e0] bg-[#fafaf8] py-8 text-center text-[13px] text-[#8b919a]">
                                    No active devices.
                                  </p>
                                ) : (
                                  <div className="grid gap-2 md:grid-cols-2">
                                    {(devicesByKey[key] ?? []).map((d) => (
                                      <div
                                        key={d.instanceId}
                                        className="flex items-center justify-between gap-3 rounded-md border border-[#ebebe7] bg-[#fafaf8] px-3 py-2.5"
                                      >
                                        <div className="min-w-0">
                                          <div className="truncate text-[13px] font-medium">
                                            {d.instanceName ||
                                              "Unknown hardware"}
                                          </div>
                                          <div className="truncate font-mono text-[10px] text-[#8b919a]">
                                            {d.instanceId} ·{" "}
                                            {new Date(
                                              d.createdAt
                                            ).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          disabled={deviceBusy}
                                          onClick={() =>
                                            removeDevice(key, d.instanceId)
                                          }
                                        >
                                          <Trash2 className="size-4 text-red-500" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            role="contentinfo"
            className="mt-auto flex items-center justify-between border-t border-[#ebebe7] px-4 py-4 text-[11px] text-[#a1a1aa] sm:px-7 lg:px-10"
          >
            <span>DevSuites Operations</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
