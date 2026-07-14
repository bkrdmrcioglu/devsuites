import { NextResponse } from "next/server";
import { isAdminSession, newManualLicenseKey } from "@/lib/admin";
import { isAppSlug } from "@/lib/lemon";
import { createManualLicense, ensureStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    email?: string;
    app?: string;
    note?: string;
    activationLimit?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const app = body.app?.trim().toLowerCase() ?? "";
  if (!email || !isAppSlug(app)) {
    return NextResponse.json(
      { error: "Valid email and app (devdock|devmail|devsql|devcheck) required" },
      { status: 400 }
    );
  }

  try {
    await ensureStore();
    const licenseKey = newManualLicenseKey(app);
    const license = await createManualLicense({
      email,
      app,
      licenseKey,
      note: body.note,
      activationLimit: body.activationLimit,
    });
    return NextResponse.json({ ok: true, license });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
