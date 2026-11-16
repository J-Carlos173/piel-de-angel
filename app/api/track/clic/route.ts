import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Contador de clics en el botón de WhatsApp. Sin cookies, sin IP ni datos de la persona:
// solo suma 1 al par (página desde la que se hizo clic, qué botón) del día.
const ORIGENES = ["flotante", "pie", "contenido"];

export async function POST(req: NextRequest) {
  try {
    const { path, origen } = await req.json();
    if (typeof path !== "string" || !/^\/[A-Za-z0-9\-_/]{0,150}$/.test(path)) {
      return NextResponse.json({ ok: false });
    }
    const o = ORIGENES.includes(origen) ? origen : "contenido";

    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS clics_whatsapp (
        id     SERIAL PRIMARY KEY,
        path   TEXT NOT NULL,
        origen TEXT NOT NULL DEFAULT 'contenido',
        date   DATE NOT NULL DEFAULT CURRENT_DATE,
        clics  INT  NOT NULL DEFAULT 0,
        UNIQUE (path, origen, date)
      )
    `;
    await sql`
      INSERT INTO clics_whatsapp (path, origen, date, clics)
      VALUES (${path}, ${o}, (NOW() AT TIME ZONE 'America/Santiago')::date, 1)
      ON CONFLICT (path, origen, date)
      DO UPDATE SET clics = clics_whatsapp.clics + 1
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
