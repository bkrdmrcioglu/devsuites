import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin";
import {
  deleteLicense,
  ensureStore,
  findLicenseByKey,
  updateLicenseActivationLimit,
  updateLicenseStatus,
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

  let body: { activationLimit?: number; status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.activationLimit == null && body.status == null) {
    return NextResponse.json(
      { error: "activationLimit or status required" },
      { status: 400 }
    );
  }

  try {
    await ensureStore();
    const existing = await findLicenseByKey(licenseKey);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.activationLimit != null) {
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
    }

    if (body.status != null) {
      if (body.status !== "active" && body.status !== "disabled") {
        return NextResponse.json(
          { error: "status must be active or disabled" },
          { status: 400 }
        );
      }
      const result = await updateLicenseStatus({
        licenseKey,
        status: body.status,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.error ?? "Failed" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
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
    const result = await deleteLicense(licenseKey);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
