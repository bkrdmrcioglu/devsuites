import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import {
  ensureStore,
  listAdminLicenses,
  listCustomers,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureStore();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const [licenses, customers] = await Promise.all([
    listAdminLicenses(300),
    listCustomers(),
  ]);
  return NextResponse.json({ licenses, customers });
}
