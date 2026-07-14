import { ensureSchema, getPool } from "@/lib/db";

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

export async function ensureStore(): Promise<void> {
  await ensureSchema();
}

export async function insertEvent(
  eventName: string,
  payload: string
): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO events (event_name, payload) VALUES ($1, $2)`,
    [eventName, payload]
  );
}

export async function insertOrderSummary(row: {
  eventName: string;
  orderId?: string | null;
  email?: string | null;
  productName?: string | null;
  variantName?: string | null;
  licenseKey?: string | null;
  app?: string | null;
  status?: string | null;
}): Promise<void> {
  const key = row.licenseKey?.trim() || null;
  if (!key) return;

  await ensureSchema();
  await getPool().query(
    `INSERT INTO licenses (
      event_name, order_id, email, product_name, variant_name,
      license_key, app, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (license_key) DO UPDATE SET
      event_name = EXCLUDED.event_name,
      order_id = COALESCE(EXCLUDED.order_id, licenses.order_id),
      email = COALESCE(EXCLUDED.email, licenses.email),
      product_name = COALESCE(EXCLUDED.product_name, licenses.product_name),
      variant_name = COALESCE(EXCLUDED.variant_name, licenses.variant_name),
      app = COALESCE(EXCLUDED.app, licenses.app),
      status = COALESCE(EXCLUDED.status, licenses.status),
      received_at = now()`,
    [
      row.eventName,
      row.orderId ?? null,
      row.email?.trim().toLowerCase() ?? null,
      row.productName ?? null,
      row.variantName ?? null,
      key,
      row.app ?? null,
      row.status ?? null,
    ]
  );
}

function mapLicenseRow(r: {
  id: string | number;
  received_at: Date | string;
  event_name: string;
  order_id: string | null;
  email: string | null;
  product_name: string | null;
  variant_name: string | null;
  license_key: string | null;
  app: string | null;
  status: string | null;
}): StoredOrder {
  const receivedAt =
    r.received_at instanceof Date
      ? r.received_at.toISOString()
      : String(r.received_at);
  return {
    id: Number(r.id),
    receivedAt,
    eventName: r.event_name,
    orderId: r.order_id,
    email: r.email,
    productName: r.product_name,
    variantName: r.variant_name,
    licenseKey: r.license_key,
    app: r.app,
    status: r.status,
  };
}

export async function listOrders(limit = 50): Promise<StoredOrder[]> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT * FROM licenses ORDER BY id DESC LIMIT $1`,
    [limit]
  );
  return rows.map(mapLicenseRow);
}

export async function listEvents(limit = 20): Promise<StoredEvent[]> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT id, received_at, event_name, payload
     FROM events ORDER BY id DESC LIMIT $1`,
    [limit]
  );
  return rows.map(
    (r: {
      id: string | number;
      received_at: Date | string;
      event_name: string;
      payload: string;
    }) => ({
      id: Number(r.id),
      receivedAt:
        r.received_at instanceof Date
          ? r.received_at.toISOString()
          : String(r.received_at),
      eventName: r.event_name,
      payload: r.payload,
    })
  );
}

export async function findLicensesByEmail(
  email: string
): Promise<StoredOrder[]> {
  await ensureSchema();
  const normalized = email.trim().toLowerCase();
  const { rows } = await getPool().query(
    `SELECT * FROM licenses
     WHERE lower(email) = $1 AND license_key IS NOT NULL
     ORDER BY id DESC`,
    [normalized]
  );
  return rows.map(mapLicenseRow);
}

export async function verifyLicenseLogin(
  email: string,
  licenseKey: string
): Promise<boolean> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT 1 FROM licenses
     WHERE lower(email) = $1 AND license_key = $2
     LIMIT 1`,
    [email.trim().toLowerCase(), licenseKey.trim()]
  );
  return rows.length > 0;
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
