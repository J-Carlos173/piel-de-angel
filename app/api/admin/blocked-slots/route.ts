import { NextRequest, NextResponse } from "next/server";
import { getAllBlockedSlots, getBlockedSlots, blockSlot, unblockSlot } from "@/lib/blocked-slots-db";
import { getAllSlots } from "@/lib/calendar";

// GET ?date=YYYY-MM-DD  → slots del día con estado bloqueado/libre
// GET sin params        → todos los bloqueos futuros
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    if (date) {
      const blocked = await getBlockedSlots(date);
      const blockedTimes = new Set(blocked.map((b) => b.time));
      const allSlots = getAllSlots(date);
      const slots = allSlots.map((time) => ({
        time,
        blocked: blockedTimes.has(time),
        reason: blocked.find((b) => b.time === time)?.reason ?? "",
      }));
      return NextResponse.json({ slots });
    }
    const all = await getAllBlockedSlots();
    return NextResponse.json({ blocked: all });
  } catch (err) {
    console.error("[blocked-slots GET]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST { date, time, reason? }  → bloquear
export async function POST(req: NextRequest) {
  try {
    const { date, time, reason } = await req.json();
    if (!date || !time) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    const slot = await blockSlot(date, time, reason ?? "");
    return NextResponse.json({ slot });
  } catch (err) {
    console.error("[blocked-slots POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE { date, time }  → desbloquear
export async function DELETE(req: NextRequest) {
  try {
    const { date, time } = await req.json();
    if (!date || !time) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    await unblockSlot(date, time);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[blocked-slots DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
