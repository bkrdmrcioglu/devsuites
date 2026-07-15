/** Shared license display helpers for the customer account portal. */

export type LicenseRow = {
  id: number;
  receivedAt: string;
  eventName: string;
  orderId: string | null;
  email: string | null;
  productName: string | null;
  variantName: string | null;
  licenseKey: string | null;
  app: string | null;
  status: string | null;
};

const APP_LABELS: Record<string, string> = {
  devdock: "DevDock",
  devmail: "DevMail",
  devsql: "DevSQL",
  devcheck: "DevCheck",
};

export function appLabel(app: string | null, product: string | null): string {
  if (app && APP_LABELS[app]) return APP_LABELS[app];
  if (product) return product;
  return "License";
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  disabled: "Cancelled",
};

export function statusLabel(status: string | null): string | null {
  if (!status) return null;
  return STATUS_LABELS[status] ?? status;
}
