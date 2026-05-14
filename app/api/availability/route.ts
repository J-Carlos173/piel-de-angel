import { NextRequest, NextResponse } from "next/server";
import { getAllSlots, getBusySlots } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return NextResponse.json({ slots: [] });
  }

  const all = getAllSlots(date);
  const busy = await getBusySlots(date);
  const slots = all.map((time) => ({ time, available: !busy.includes(time) }));

  return NextResponse.json({ slots });
}
