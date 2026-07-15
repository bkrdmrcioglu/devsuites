import { Pool } from "pg";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  return url;
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      max: 5,
      ssl:
        process.env.DATABASE_SSL === "1"
          ? { rejectUnauthorized: false }
          : false,
    });
  }
  return pool;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_name TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS licenses (
  id BIGSERIAL PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_name TEXT NOT NULL,
  order_id TEXT,
  email TEXT,
  product_name TEXT,
  variant_name TEXT,
  license_key TEXT,
  app TEXT,
  status TEXT,
  source TEXT NOT NULL DEFAULT 'lemon',
  activation_limit INT NOT NULL DEFAULT 5,
  note TEXT,
  UNIQUE (license_key)
);

CREATE INDEX IF NOT EXISTS licenses_email_idx ON licenses (lower(email));

CREATE TABLE IF NOT EXISTS license_instances (
  id BIGSERIAL PRIMARY KEY,
  license_key TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  instance_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (license_key, instance_id)
);

CREATE INDEX IF NOT EXISTS license_instances_key_idx
  ON license_instances (license_key);

ALTER TABLE licenses ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'lemon';
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS activation_limit INT NOT NULL DEFAULT 5;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS note TEXT;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT,
  github_id TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (lower(email));

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_github_id_uidx
  ON users (github_id) WHERE github_id IS NOT NULL;
`;

export async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await getPool().query(SCHEMA_SQL);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}
