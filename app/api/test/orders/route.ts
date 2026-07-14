import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/lemon";
import { ensureStore, listEvents, listOrders } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Enable LEMON_MOCK=1" }, { status: 404 });
  }
  ensureStore();
  return NextResponse.json({
    mock: true,
    orders: listOrders(50),
    events: listEvents(20).map((e) => ({
      id: e.id,
      receivedAt: e.receivedAt,
      eventName: e.eventName,
      payloadBytes: e.payload.length,
    })),
  });
}
