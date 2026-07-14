import { NextResponse } from "next/server";
import { deactivateDbLicense, ensureStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let licenseKey = "";
  let instanceId = "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      license_key?: string;
      instance_id?: string;
    };
    licenseKey = body.license_key?.trim() ?? "";
    instanceId = body.instance_id?.trim() ?? "";
  } else {
    const form = await req.formData();
    licenseKey = String(form.get("license_key") ?? "").trim();
    instanceId = String(form.get("instance_id") ?? "").trim();
  }

  if (!licenseKey || !instanceId) {
    return NextResponse.json(
      { deactivated: false, error: "license_key and instance_id required" },
      { status: 422 }
    );
  }

  try {
    await ensureStore();
    const result = await deactivateDbLicense({ licenseKey, instanceId });
    const status = result.deactivated ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deactivate failed";
    return NextResponse.json(
      { deactivated: false, error: message },
      { status: 500 }
    );
  }
}
