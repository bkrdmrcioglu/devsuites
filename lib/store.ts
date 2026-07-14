import { mkdirSync, appendFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type StoredEvent = {
  id: number;
  receivedAt: string;
  eventName: string;
  payload: string;
};

export type StoredOrder = {
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

type Paths = { events: string; orders: string };

let paths: Paths | null = null;
let eventSeq = 0;
let orderSeq = 0;

function dataDir(): string {
  return process.env.DATA_DIR ?? join(process.cwd(), "data");
}

export function ensureStore(dir = dataDir()): Paths {
  if (paths) return paths;
  mkdirSync(dir, { recursive: true });
  paths = {
    events: join(dir, "events.jsonl"),
    orders: join(dir, "orders.jsonl"),
  };
  // Resume sequences from existing files
  eventSeq = countLines(paths.events);
  orderSeq = countLines(paths.orders);
  return paths;
}

function countLines(file: string): number {
  if (!existsSync(file)) return 0;
  const text = readFileSync(file, "utf8");
  if (!text.trim()) return 0;
  return text.split("\n").filter((l) => l.trim()).length;
}

function appendJson(file: string, row: unknown): void {
  appendFileSync(file, `${JSON.stringify(row)}\n`, "utf8");
}

function readJsonl<T>(file: string): T[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

export function insertEvent(eventName: string, payload: string): void {
  const p = ensureStore();
  eventSeq += 1;
  appendJson(p.events, {
    id: eventSeq,
    receivedAt: new Date().toISOString(),
    eventName,
    payload,
  } satisfies StoredEvent);
}

export function insertOrderSummary(row: {
  eventName: string;
  orderId?: string | null;
  email?: string | null;
  productName?: string | null;
  variantName?: string | null;
  licenseKey?: string | null;
  app?: string | null;
  status?: string | null;
}): void {
  const p = ensureStore();
  orderSeq += 1;
  appendJson(p.orders, {
    id: orderSeq,
    receivedAt: new Date().toISOString(),
    eventName: row.eventName,
    orderId: row.orderId ?? null,
    email: row.email ?? null,
    productName: row.productName ?? null,
    variantName: row.variantName ?? null,
    licenseKey: row.licenseKey ?? null,
    app: row.app ?? null,
    status: row.status ?? null,
  } satisfies StoredOrder);
}

export function listOrders(limit = 50): StoredOrder[] {
  ensureStore();
  const rows = readJsonl<StoredOrder>(paths!.orders);
  return rows.reverse().slice(0, limit);
}

export function listEvents(limit = 20): StoredEvent[] {
  ensureStore();
  const rows = readJsonl<StoredEvent>(paths!.events);
  return rows.reverse().slice(0, limit);
}

export function summarizeWebhook(
  eventName: string,
  json: unknown
): {
  orderId?: string | null;
  email?: string | null;
  productName?: string | null;
  variantName?: string | null;
  licenseKey?: string | null;
  app?: string | null;
  status?: string | null;
} {
  const root = json as {
    meta?: { custom_data?: { app?: string } };
    data?: {
      id?: string;
      attributes?: Record<string, unknown>;
    };
  };

  const attrs = root.data?.attributes ?? {};
  const app =
    root.meta?.custom_data?.app ??
    (typeof attrs.custom_data === "object" &&
    attrs.custom_data &&
    "app" in (attrs.custom_data as object)
      ? String((attrs.custom_data as { app?: string }).app)
      : null);

  if (eventName === "license_key_created" || eventName.includes("license_key")) {
    return {
      orderId:
        attrs.order_id != null ? String(attrs.order_id) : root.data?.id ?? null,
      email: (attrs.user_email as string) ?? null,
      productName: (attrs.product_name as string) ?? null,
      variantName: (attrs.variant_name as string) ?? null,
      licenseKey: (attrs.key as string) ?? null,
      app,
      status: (attrs.status as string) ?? null,
    };
  }

  return {
    orderId: root.data?.id ?? (attrs.identifier as string) ?? null,
    email:
      (attrs.user_email as string) ??
      (attrs.customer_email as string) ??
      null,
    productName:
      (attrs.first_order_item as { product_name?: string } | undefined)
        ?.product_name ??
      (attrs.product_name as string) ??
      null,
    variantName:
      (attrs.first_order_item as { variant_name?: string } | undefined)
        ?.variant_name ??
      (attrs.variant_name as string) ??
      null,
    licenseKey: null,
    app,
    status: (attrs.status as string) ?? null,
  };
}
