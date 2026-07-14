import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
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

let db: DatabaseSync | null = null;

export function ensureStore(
  dataDir = process.env.DATA_DIR ?? join(process.cwd(), "data")
): DatabaseSync {
  if (db) return db;
  mkdirSync(dataDir, { recursive: true });
  const path = join(dataDir, "lemon.sqlite");
  const database = new DatabaseSync(path);
  database.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      received_at TEXT NOT NULL,
      event_name TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      received_at TEXT NOT NULL,
      event_name TEXT NOT NULL,
      order_id TEXT,
      email TEXT,
      product_name TEXT,
      variant_name TEXT,
      license_key TEXT,
      app TEXT,
      status TEXT
    );
  `);
  db = database;
  return database;
}

function database(): DatabaseSync {
  return ensureStore();
}

export function insertEvent(eventName: string, payload: string): void {
  database()
    .prepare(
      `INSERT INTO events (received_at, event_name, payload) VALUES (?, ?, ?)`
    )
    .run(new Date().toISOString(), eventName, payload);
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
  database()
    .prepare(
      `INSERT INTO orders (
        received_at, event_name, order_id, email, product_name,
        variant_name, license_key, app, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      new Date().toISOString(),
      row.eventName,
      row.orderId ?? null,
      row.email ?? null,
      row.productName ?? null,
      row.variantName ?? null,
      row.licenseKey ?? null,
      row.app ?? null,
      row.status ?? null
    );
}

export function listOrders(limit = 50): StoredOrder[] {
  const rows = database()
    .prepare(
      `SELECT id, received_at as receivedAt, event_name as eventName,
              order_id as orderId, email, product_name as productName,
              variant_name as variantName, license_key as licenseKey,
              app, status
       FROM orders ORDER BY id DESC LIMIT ?`
    )
    .all(limit) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    receivedAt: String(r.receivedAt),
    eventName: String(r.eventName),
    orderId: r.orderId == null ? null : String(r.orderId),
    email: r.email == null ? null : String(r.email),
    productName: r.productName == null ? null : String(r.productName),
    variantName: r.variantName == null ? null : String(r.variantName),
    licenseKey: r.licenseKey == null ? null : String(r.licenseKey),
    app: r.app == null ? null : String(r.app),
    status: r.status == null ? null : String(r.status),
  }));
}

export function listEvents(limit = 20): StoredEvent[] {
  const rows = database()
    .prepare(
      `SELECT id, received_at as receivedAt, event_name as eventName, payload
       FROM events ORDER BY id DESC LIMIT ?`
    )
    .all(limit) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: Number(r.id),
    receivedAt: String(r.receivedAt),
    eventName: String(r.eventName),
    payload: String(r.payload),
  }));
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
