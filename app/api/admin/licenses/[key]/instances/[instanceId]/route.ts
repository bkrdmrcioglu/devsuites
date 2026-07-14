import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import { ensureStore, removeLicenseInstance } from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string; instanceId: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: encoded, instanceId: instanceEncoded } = await ctx.params;
  const licenseKey = decodeURIComponent(encoded).trim();
  const instanceId = decodeURIComponent(instanceEncoded).trim();
  if (!licenseKey || !instanceId) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    await ensureStore();
    const result = await removeLicenseInstance({ licenseKey, instanceId });
    if (!result.removed) {
      return NextResponse.json(
        { error: result.error ?? "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      remaining: result.remaining,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
