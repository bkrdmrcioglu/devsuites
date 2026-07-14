import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import {
  ensureStore,
  findLicenseByKey,
  updateLicenseActivationLimit,
} from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ key: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: encoded } = await ctx.params;
  const licenseKey = decodeURIComponent(encoded).trim();
  if (!licenseKey) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  let body: { activationLimit?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.activationLimit == null) {
    return NextResponse.json(
      { error: "activationLimit required" },
      { status: 400 }
    );
  }

  try {
    await ensureStore();
    const existing = await findLicenseByKey(licenseKey);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const result = await updateLicenseActivationLimit({
      licenseKey,
      activationLimit: body.activationLimit,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      ok: true,
      activationLimit: Math.floor(body.activationLimit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
