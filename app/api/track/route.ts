import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (!path || typeof path !== "string") return NextResponse.json({ ok: false });

    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS page_views (
        id    SERIAL PRIMARY KEY,
        path  TEXT NOT NULL,
        date  DATE NOT NULL DEFAULT CURRENT_DATE,
        views INT  NOT NULL DEFAULT 0,
        UNIQUE (path, date)
      )
    `;
    await sql`
      INSERT INTO page_views (path, date, views)
      VALUES (${path}, (NOW() AT TIME ZONE 'America/Santiago')::date, 1)
      ON CONFLICT (path, date)
      DO UPDATE SET views = page_views.views + 1
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
