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
  source: string;
  activationLimit: number;
  note: string | null;
  activationCount?: number;
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
      license_key, app, status, source
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'lemon')
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
  source?: string | null;
  activation_limit?: number | string | null;
  note?: string | null;
  activation_count?: number | string | null;
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
    source: r.source ?? "lemon",
    activationLimit: Number(r.activation_limit ?? 5),
    note: r.note ?? null,
    activationCount:
      r.activation_count != null ? Number(r.activation_count) : undefined,
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

const APP_PRODUCT: Record<string, string> = {
  devdock: "DevDock Pro",
  devmail: "DevMail Pro",
  devsql: "DevSQL Pro",
  devcheck: "DevCheck Pro",
};

export async function listAdminLicenses(limit = 200): Promise<StoredOrder[]> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT l.*,
      (SELECT COUNT(*)::int FROM license_instances i WHERE i.license_key = l.license_key) AS activation_count
     FROM licenses l
     WHERE l.license_key IS NOT NULL
     ORDER BY l.id DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map(mapLicenseRow);
}

export type CustomerSummary = {
  email: string;
  licenseCount: number;
  apps: string[];
  latestAt: string;
};

export async function listCustomers(): Promise<CustomerSummary[]> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT lower(email) AS email,
            COUNT(*)::int AS license_count,
            array_agg(DISTINCT app) FILTER (WHERE app IS NOT NULL) AS apps,
            MAX(received_at) AS latest_at
     FROM licenses
     WHERE email IS NOT NULL AND license_key IS NOT NULL
     GROUP BY lower(email)
     ORDER BY latest_at DESC`
  );
  return rows.map(
    (r: {
      email: string;
      license_count: number;
      apps: string[] | null;
      latest_at: Date | string;
    }) => ({
      email: r.email,
      licenseCount: Number(r.license_count),
      apps: r.apps ?? [],
      latestAt:
        r.latest_at instanceof Date
          ? r.latest_at.toISOString()
          : String(r.latest_at),
    })
  );
}

export async function createManualLicense(opts: {
  email: string;
  app: string;
  licenseKey: string;
  note?: string | null;
  activationLimit?: number;
}): Promise<StoredOrder> {
  await ensureSchema();
  const email = opts.email.trim().toLowerCase();
  const app = opts.app.trim().toLowerCase();
  const product = APP_PRODUCT[app] ?? `${app} Pro`;
  const { rows } = await getPool().query(
    `INSERT INTO licenses (
      event_name, order_id, email, product_name, variant_name,
      license_key, app, status, source, activation_limit, note
    ) VALUES (
      'admin_created', NULL, $1, $2, 'Admin',
      $3, $4, 'inactive', 'admin', $5, $6
    )
    RETURNING *`,
    [
      email,
      product,
      opts.licenseKey.trim(),
      app,
      opts.activationLimit ?? 5,
      opts.note?.trim() || null,
    ]
  );
  return mapLicenseRow(rows[0]);
}

export async function findLicenseByKey(
  licenseKey: string
): Promise<StoredOrder | null> {
  await ensureSchema();
  const { rows } = await getPool().query(
    `SELECT l.*,
      (SELECT COUNT(*)::int FROM license_instances i WHERE i.license_key = l.license_key) AS activation_count
     FROM licenses l
     WHERE l.license_key = $1
     LIMIT 1`,
    [licenseKey.trim()]
  );
  if (!rows[0]) return null;
  return mapLicenseRow(rows[0]);
}

export async function activateDbLicense(opts: {
  licenseKey: string;
  instanceName: string;
}): Promise<{
  activated: boolean;
  error?: string;
  instance?: { id: string };
  meta?: { customer_email: string | null };
}> {
  const lic = await findLicenseByKey(opts.licenseKey);
  if (!lic || !lic.licenseKey) {
    return { activated: false, error: "license_key not found" };
  }
  if (lic.status === "disabled") {
    return { activated: false, error: "license_key is disabled" };
  }
  const count = lic.activationCount ?? 0;
  if (count >= lic.activationLimit) {
    return { activated: false, error: "activation limit reached" };
  }

  const instanceId = randomInstanceId();
  await getPool().query(
    `INSERT INTO license_instances (license_key, instance_id, instance_name)
     VALUES ($1, $2, $3)`,
    [lic.licenseKey, instanceId, opts.instanceName]
  );
  await getPool().query(
    `UPDATE licenses SET status = 'active' WHERE license_key = $1`,
    [lic.licenseKey]
  );

  return {
    activated: true,
    instance: { id: instanceId },
    meta: { customer_email: lic.email },
  };
}

export async function validateDbLicense(opts: {
  licenseKey: string;
  instanceId?: string | null;
}): Promise<{
  valid: boolean;
  error?: string;
  meta?: { customer_email: string | null };
}> {
  const lic = await findLicenseByKey(opts.licenseKey);
  if (!lic || !lic.licenseKey) {
    return { valid: false, error: "license_key not found" };
  }
  if (lic.status === "disabled") {
    return { valid: false, error: "license_key is disabled" };
  }
  if (opts.instanceId) {
    const { rows } = await getPool().query(
      `SELECT 1 FROM license_instances
       WHERE license_key = $1 AND instance_id = $2 LIMIT 1`,
      [lic.licenseKey, opts.instanceId]
    );
    if (!rows[0]) {
      return { valid: false, error: "license_key instance not found" };
    }
  }
  return {
    valid: true,
    meta: { customer_email: lic.email },
  };
}

export async function deactivateDbLicense(opts: {
  licenseKey: string;
  instanceId: string;
}): Promise<{ deactivated: boolean; error?: string }> {
  const lic = await findLicenseByKey(opts.licenseKey);
  if (!lic || !lic.licenseKey) {
    return { deactivated: false, error: "license_key not found" };
  }
  const result = await getPool().query(
    `DELETE FROM license_instances
     WHERE license_key = $1 AND instance_id = $2`,
    [lic.licenseKey, opts.instanceId]
  );
  if ((result.rowCount ?? 0) < 1) {
    return { deactivated: false, error: "license_key instance not found" };
  }
  const { rows } = await getPool().query(
    `SELECT COUNT(*)::int AS c FROM license_instances WHERE license_key = $1`,
    [lic.licenseKey]
  );
  if (Number(rows[0]?.c ?? 0) === 0) {
    await getPool().query(
      `UPDATE licenses SET status = 'inactive' WHERE license_key = $1`,
      [lic.licenseKey]
    );
  }
  return { deactivated: true };
}

export type LicenseInstanceRow = {
  instanceId: string;
  instanceName: string | null;
  createdAt: string;
};

export async function listLicenseInstances(
  licenseKey: string
): Promise<LicenseInstanceRow[]> {
  const { rows } = await getPool().query(
    `SELECT instance_id, instance_name, created_at
     FROM license_instances
     WHERE license_key = $1
     ORDER BY created_at ASC`,
    [licenseKey]
  );
  return rows.map((r) => ({
    instanceId: String(r.instance_id),
    instanceName: r.instance_name != null ? String(r.instance_name) : null,
    createdAt:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
  }));
}

export async function removeLicenseInstance(opts: {
  licenseKey: string;
  instanceId: string;
}): Promise<{ removed: boolean; error?: string; remaining: number }> {
  const result = await deactivateDbLicense(opts);
  if (!result.deactivated) {
    return {
      removed: false,
      error: result.error ?? "not found",
      remaining: -1,
    };
  }
  const { rows } = await getPool().query(
    `SELECT COUNT(*)::int AS c FROM license_instances WHERE license_key = $1`,
    [opts.licenseKey]
  );
  return { removed: true, remaining: Number(rows[0]?.c ?? 0) };
}

export async function resetLicenseDevices(
  licenseKey: string
): Promise<{ reset: boolean; removed: number; error?: string }> {
  const lic = await findLicenseByKey(licenseKey);
  if (!lic || !lic.licenseKey) {
    return { reset: false, removed: 0, error: "license_key not found" };
  }
  const result = await getPool().query(
    `DELETE FROM license_instances WHERE license_key = $1`,
    [lic.licenseKey]
  );
  const removed = result.rowCount ?? 0;
  if (removed > 0) {
    await getPool().query(
      `UPDATE licenses SET status = 'inactive' WHERE license_key = $1`,
      [lic.licenseKey]
    );
  }
  return { reset: true, removed };
}

export async function updateLicenseActivationLimit(opts: {
  licenseKey: string;
  activationLimit: number;
}): Promise<{ ok: boolean; error?: string }> {
  const limit = Math.floor(opts.activationLimit);
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
    return { ok: false, error: "activationLimit must be 1–100" };
  }
  const result = await getPool().query(
    `UPDATE licenses SET activation_limit = $2 WHERE license_key = $1`,
    [opts.licenseKey, limit]
  );
  if ((result.rowCount ?? 0) < 1) {
    return { ok: false, error: "license_key not found" };
  }
  return { ok: true };
}

export async function updateLicenseStatus(opts: {
  licenseKey: string;
  status: "active" | "disabled";
}): Promise<{ ok: boolean; error?: string }> {
  const result = await getPool().query(
    `UPDATE licenses SET status = $2 WHERE license_key = $1`,
    [opts.licenseKey, opts.status]
  );
  if ((result.rowCount ?? 0) < 1) {
    return { ok: false, error: "license_key not found" };
  }
  return { ok: true };
}

export async function deleteLicense(
  licenseKey: string
): Promise<{ ok: boolean; error?: string }> {
  await getPool().query(
    `DELETE FROM license_instances WHERE license_key = $1`,
    [licenseKey]
  );
  const result = await getPool().query(
    `DELETE FROM licenses WHERE license_key = $1`,
    [licenseKey]
  );
  if ((result.rowCount ?? 0) < 1) {
    return { ok: false, error: "license_key not found" };
  }
  return { ok: true };
}

function randomInstanceId(): string {
  return `ds_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
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
