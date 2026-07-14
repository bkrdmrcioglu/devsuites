import { NextResponse } from "next/server";
import { activateDbLicense, ensureStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let licenseKey = "";
  let instanceName = "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      license_key?: string;
      instance_name?: string;
    };
    licenseKey = body.license_key?.trim() ?? "";
    instanceName = body.instance_name?.trim() || "Mac";
  } else {
    const form = await req.formData();
    licenseKey = String(form.get("license_key") ?? "").trim();
    instanceName = String(form.get("instance_name") ?? "Mac").trim() || "Mac";
  }

  if (!licenseKey) {
    return NextResponse.json(
      { activated: false, error: "license_key is required" },
      { status: 422 }
    );
  }

  try {
    await ensureStore();
    const result = await activateDbLicense({ licenseKey, instanceName });
    const status = result.activated ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Activate failed";
    return NextResponse.json(
      { activated: false, error: message },
      { status: 500 }
    );
  }
}
