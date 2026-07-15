import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { customerResetLicenseDevices, ensureStore } from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: encoded } = await ctx.params;
  const licenseKey = decodeURIComponent(encoded).trim();
  if (!licenseKey) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    await ensureStore();
    const result = await customerResetLicenseDevices({ email, licenseKey });
    if (!result.reset) {
      return NextResponse.json(
        { error: result.error ?? "Failed", alreadyUsed: result.alreadyUsed },
        { status: result.alreadyUsed ? 409 : 404 }
      );
    }
    return NextResponse.json({ ok: true, removed: result.removed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
