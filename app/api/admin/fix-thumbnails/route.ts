import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureServiciosTable } from "@/lib/services-db";

const PHOTOS: { keywords: string[]; url: string }[] = [
  { keywords: ["ceja"],                  url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" },
  { keywords: ["pestaña", "lifting"],    url: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=600&q=80" },
  { keywords: ["limpieza"],              url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80" },
  { keywords: ["hidrat"],                url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80" },
  { keywords: ["anti-edad", "antiedad", "rejuvenec"], url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80" },
  { keywords: ["bb glow", "bb"],         url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80" },
  { keywords: ["dermapen", "microneeding", "aguja"], url: "https://images.unsplash.com/photo-1618945524163-32451704cbb8?w=600&q=80" },
  { keywords: ["peeling", "exfoli"],     url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80" },
  { keywords: ["masaje", "bienestar", "ritual", "relaj"], url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80" },
  { keywords: ["corporal"],              url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80" },
  { keywords: ["maquillaje"],            url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80" },
  { keywords: ["skincare"],              url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80" },
  { keywords: ["facial", "tratamiento"], url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80" },
];

const FALLBACK = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80";

function pickPhoto(title: string, categoria: string): string {
  const haystack = (title + " " + categoria).toLowerCase();
  for (const p of PHOTOS) {
    if (p.keywords.some((k) => haystack.includes(k))) return p.url;
  }
  return FALLBACK;
}

export async function GET() {
  try {
    await ensureServiciosTable();
    const sql = getDb();

    const rows = await sql`
      SELECT id, title, categoria FROM servicios
      WHERE thumbnail IS NULL OR thumbnail = ''
    `;

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, updated: 0, message: "Todos los servicios ya tienen foto." });
    }

    const updated: string[] = [];
    for (const row of rows) {
      const r = row as { id: string; title: string; categoria: string };
      const url = pickPhoto(r.title, r.categoria ?? "");
      await sql`UPDATE servicios SET thumbnail = ${url} WHERE id = ${r.id}`;
      updated.push(r.title);
    }

    return NextResponse.json({ ok: true, updated: updated.length, servicios: updated });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
