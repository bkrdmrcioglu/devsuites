import { NextResponse } from "next/server";
import { ensureStore, validateDbLicense } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let licenseKey = "";
  let instanceId: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      license_key?: string;
      instance_id?: string;
    };
    licenseKey = body.license_key?.trim() ?? "";
    instanceId = body.instance_id?.trim() || null;
  } else {
    const form = await req.formData();
    licenseKey = String(form.get("license_key") ?? "").trim();
    const raw = String(form.get("instance_id") ?? "").trim();
    instanceId = raw || null;
  }

  if (!licenseKey) {
    return NextResponse.json(
      { valid: false, error: "license_key is required" },
      { status: 422 }
    );
  }

  try {
    await ensureStore();
    const result = await validateDbLicense({ licenseKey, instanceId });
    const status = result.valid ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validate failed";
    return NextResponse.json(
      { valid: false, error: message },
      { status: 500 }
    );
  }
}
