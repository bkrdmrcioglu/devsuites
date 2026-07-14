import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/lemon";
import { ensureStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  let db: "ok" | "error" | "unset" = "unset";
  let dbError: string | undefined;
  if (!process.env.DATABASE_URL?.trim()) {
    db = "unset";
  } else {
    try {
      await ensureStore();
      db = "ok";
    } catch (err) {
      db = "error";
      dbError = err instanceof Error ? err.message : "unknown";
    }
  }

  return NextResponse.json({
    ok: db === "ok" || isMockMode(),
    service: "devsuites",
    mock: isMockMode(),
    db,
    ...(dbError ? { dbError } : {}),
    time: new Date().toISOString(),
  });
}
