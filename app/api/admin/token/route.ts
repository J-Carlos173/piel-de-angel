import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const buyOrder = req.nextUrl.searchParams.get("order");
  if (!buyOrder) return NextResponse.json({ error: "Falta order" }, { status: 400 });
  const sql = getDb();
  const rows = await sql`SELECT token_ws FROM orders WHERE buy_order = ${buyOrder} LIMIT 1`;
  const token = rows[0]?.token_ws ?? null;
  return NextResponse.json({ token });
}
