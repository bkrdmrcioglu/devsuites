import { createHmac, timingSafeEqual } from "node:crypto";

const LEMON_API = "https://api.lemonsqueezy.com/v1";

export type AppSlug = "devdock" | "devmail" | "devsql" | "devcheck";

const VARIANT_ENV: Record<AppSlug, string> = {
  devdock: "LEMON_VARIANT_DEVDOCK",
  devmail: "LEMON_VARIANT_DEVMAIL",
  devsql: "LEMON_VARIANT_DEVSQL",
  devcheck: "LEMON_VARIANT_DEVCHECK",
};

export function isMockMode(): boolean {
  const v = (process.env.LEMON_MOCK ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isAppSlug(value: string): value is AppSlug {
  return value in VARIANT_ENV;
}

export function requireConfig(): {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
} {
  if (isMockMode()) {
    return {
      apiKey: process.env.LEMON_API_KEY?.trim() || "mock_key",
      storeId: process.env.LEMON_STORE_ID?.trim() || "1",
      webhookSecret:
        process.env.LEMON_WEBHOOK_SECRET?.trim() || "mock_webhook_secret",
    };
  }
  const apiKey = process.env.LEMON_API_KEY?.trim() ?? "";
  const storeId = process.env.LEMON_STORE_ID?.trim() ?? "";
  const webhookSecret = process.env.LEMON_WEBHOOK_SECRET?.trim() ?? "";
  if (!apiKey || !storeId || !webhookSecret) {
    throw new Error(
      "Missing LEMON_API_KEY, LEMON_STORE_ID, or LEMON_WEBHOOK_SECRET"
    );
  }
  return { apiKey, storeId, webhookSecret };
}

export function variantIdFor(app: AppSlug): string {
  if (isMockMode()) {
    return process.env[VARIANT_ENV[app]]?.trim() || `mock-variant-${app}`;
  }
  const envName = VARIANT_ENV[app];
  const id = process.env[envName]?.trim() ?? "";
  if (!id) {
    throw new Error(`Missing ${envName} for /api/buy/${app}`);
  }
  return id;
}

export async function createCheckout(opts: {
  apiKey: string;
  storeId: string;
  variantId: string;
  app: AppSlug;
  origin: string;
}): Promise<string> {
  if (isMockMode()) {
    return `${opts.origin}/api/test/checkout/${opts.app}`;
  }

  const res = await fetch(`${LEMON_API}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              app: opts.app,
            },
          },
          product_options: {
            redirect_url: `https://devsuites.dev/${opts.app}/?purchased=1`,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: opts.storeId },
          },
          variant: {
            data: { type: "variants", id: opts.variantId },
          },
        },
      },
    }),
  });

  const body = (await res.json()) as {
    data?: { attributes?: { url?: string } };
    errors?: Array<{ detail?: string; title?: string }>;
  };

  if (!res.ok) {
    const detail =
      body.errors?.map((e) => e.detail ?? e.title).filter(Boolean).join("; ") ??
      `Lemon checkout failed (${res.status})`;
    throw new Error(detail);
  }

  const url = body.data?.attributes?.url;
  if (!url) {
    throw new Error("Lemon checkout response missing url");
  }
  return url;
}

export function signWebhook(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function verifyWebhook(
  rawBody: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) return false;
  const digest = signWebhook(rawBody, secret);
  try {
    const a = Buffer.from(digest, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function mockLicenseKey(app: AppSlug): string {
  return `MOCK-${app.toUpperCase()}-PRO-0000-TEST`;
}

export function mockOrderPayload(app: AppSlug, eventName: string): object {
  const key = mockLicenseKey(app);
  if (eventName === "license_key_created") {
    return {
      meta: {
        event_name: eventName,
        custom_data: { app },
      },
      data: {
        type: "license-keys",
        id: `mock-lic-${app}`,
        attributes: {
          store_id: 1,
          order_id: 9001,
          user_email: "test@devsuites.dev",
          key,
          key_short: "TEST",
          status: "inactive",
          product_name: `${app} Pro`,
          variant_name: "Default",
        },
      },
    };
  }
  return {
    meta: {
      event_name: eventName,
      custom_data: { app },
    },
    data: {
      type: "orders",
      id: `mock-order-${app}`,
      attributes: {
        store_id: 1,
        identifier: `mock-order-${app}`,
        status: "paid",
        user_email: "test@devsuites.dev",
        customer_email: "test@devsuites.dev",
        first_order_item: {
          product_name: `${app} Pro`,
          variant_name: "Default",
        },
      },
    },
  };
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function requestOrigin(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}
