import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const sql = getDb();
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM reviews`;
  await sql`DELETE FROM page_views`;
  await sql`DELETE FROM blocked_slots`;
  return NextResponse.json({ ok: true, msg: "Datos de prueba eliminados" });
}
