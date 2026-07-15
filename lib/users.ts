import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getPool } from "@/lib/db";

const KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, KEY_LEN);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function createUser(opts: {
  email: string;
  password: string;
}): Promise<{ ok: boolean; error?: string }> {
  const email = opts.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address" };
  }
  if (opts.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const existing = await getPool().query(
    `SELECT 1 FROM users WHERE lower(email) = lower($1)`,
    [email]
  );
  if ((existing.rowCount ?? 0) > 0) {
    return { ok: false, error: "An account with this email already exists" };
  }

  await getPool().query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)`,
    [email, hashPassword(opts.password)]
  );
  return { ok: true };
}

export async function verifyUserLogin(
  email: string,
  password: string
): Promise<boolean> {
  const result = await getPool().query<{ password_hash: string | null }>(
    `SELECT password_hash FROM users WHERE lower(email) = lower($1)`,
    [email.trim().toLowerCase()]
  );
  const row = result.rows[0];
  if (!row?.password_hash) return false;
  return verifyPassword(password, row.password_hash);
}

export type GithubProfile = {
  id: number | string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

/** Create or link a user from a verified GitHub profile. Returns session email. */
export async function upsertGithubUser(
  profile: GithubProfile
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const githubId = String(profile.id);
  const email = profile.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return {
      ok: false,
      error: "GitHub did not provide an email. Make a public or primary email visible on your GitHub account.",
    };
  }

  const pool = getPool();
  const name = profile.name?.trim() || null;
  const avatarUrl = profile.avatarUrl?.trim() || null;

  const byGithub = await pool.query<{ email: string }>(
    `SELECT email FROM users WHERE github_id = $1`,
    [githubId]
  );
  if (byGithub.rows[0]) {
    await pool.query(
      `UPDATE users SET name = COALESCE($2, name), avatar_url = COALESCE($3, avatar_url)
       WHERE github_id = $1`,
      [githubId, name, avatarUrl]
    );
    return { ok: true, email: byGithub.rows[0].email };
  }

  const byEmail = await pool.query<{ email: string; github_id: string | null }>(
    `SELECT email, github_id FROM users WHERE lower(email) = lower($1)`,
    [email]
  );
  if (byEmail.rows[0]) {
    if (byEmail.rows[0].github_id && byEmail.rows[0].github_id !== githubId) {
      return {
        ok: false,
        error: "This email is already linked to another GitHub account.",
      };
    }
    await pool.query(
      `UPDATE users
       SET github_id = $2,
           name = COALESCE($3, name),
           avatar_url = COALESCE($4, avatar_url)
       WHERE lower(email) = lower($1)`,
      [email, githubId, name, avatarUrl]
    );
    return { ok: true, email: byEmail.rows[0].email };
  }

  await pool.query(
    `INSERT INTO users (email, password_hash, github_id, name, avatar_url)
     VALUES ($1, NULL, $2, $3, $4)`,
    [email, githubId, name, avatarUrl]
  );
  return { ok: true, email };
}

export async function getUserByEmail(email: string): Promise<{
  email: string;
  name: string | null;
  avatarUrl: string | null;
  githubId: string | null;
  hasPassword: boolean;
  createdAt: string | null;
} | null> {
  const result = await getPool().query<{
    email: string;
    name: string | null;
    avatar_url: string | null;
    github_id: string | null;
    password_hash: string | null;
    created_at: Date | string | null;
  }>(
    `SELECT email, name, avatar_url, github_id, password_hash, created_at
     FROM users
     WHERE lower(email) = lower($1)`,
    [email.trim().toLowerCase()]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    githubId: row.github_id,
    hasPassword: Boolean(row.password_hash),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at
          ? String(row.created_at)
          : null,
  };
}
