import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const sql = getDb();
  await sql`DELETE FROM orders`;
  await sql`DELETE FROM reviews`;
  await sql`DELETE FROM page_views`;
  await sql`DELETE FROM blocked_slots`;
  return NextResponse.json({ ok: true, msg: "Datos de prueba eliminados" });
}
