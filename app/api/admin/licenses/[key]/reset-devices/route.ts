import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import { ensureStore, resetLicenseDevices } from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: encoded } = await ctx.params;
  const licenseKey = decodeURIComponent(encoded).trim();
  if (!licenseKey) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    await ensureStore();
    const result = await resetLicenseDevices(licenseKey);
    if (!result.reset) {
      return NextResponse.json(
        { error: result.error ?? "Failed" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      removed: result.removed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
