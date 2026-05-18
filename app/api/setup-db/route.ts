import { NextResponse } from "next/server";
import { ensureOrdersTable } from "@/lib/db";

export async function GET() {
  try {
    await ensureOrdersTable();
    return NextResponse.json({ ok: true, message: "Tabla 'orders' lista." });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
