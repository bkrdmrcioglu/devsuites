import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/lemon";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "devsuites",
    mock: isMockMode(),
    time: new Date().toISOString(),
  });
}
