import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/lemon";
import { ensureStore, listEvents, listOrders } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Enable LEMON_MOCK=1" }, { status: 404 });
  }
  await ensureStore();
  const [orders, events] = await Promise.all([
    listOrders(50),
    listEvents(20),
  ]);
  return NextResponse.json({
    mock: true,
    orders,
    events: events.map((e) => ({
      id: e.id,
      receivedAt: e.receivedAt,
      eventName: e.eventName,
      payloadBytes: e.payload.length,
    })),
  });
}
