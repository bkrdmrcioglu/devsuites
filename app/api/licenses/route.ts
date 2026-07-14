import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { ensureStore, findLicensesByEmail } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureStore();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const licenses = await findLicensesByEmail(email);
  return NextResponse.json({ email, licenses });
}
