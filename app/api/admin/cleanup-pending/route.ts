import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Solo Vercel Cron puede llamar esto (header Authorization con CRON_SECRET)
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const result = await sql`
    DELETE FROM orders
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '2 hours'
    RETURNING buy_order
  `;

  console.log(`[cleanup-pending] Eliminadas ${result.length} órdenes pendientes`);
  return NextResponse.json({ ok: true, deleted: result.length });
}
