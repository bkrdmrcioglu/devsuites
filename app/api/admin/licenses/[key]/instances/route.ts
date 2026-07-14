import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import {
  ensureStore,
  findLicenseByKey,
  listLicenseInstances,
} from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, ctx: Ctx) {
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
    const license = await findLicenseByKey(licenseKey);
    if (!license) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const instances = await listLicenseInstances(licenseKey);
    return NextResponse.json({
      licenseKey,
      activationLimit: license.activationLimit,
      activationCount: instances.length,
      instances,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
