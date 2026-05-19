import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ensureServiciosTable } from "@/lib/services-db";

const SERVICIOS_INICIALES = [
  { title: "Limpieza Facial",       description: "Una purificación profunda que elimina impurezas y devuelve frescura, luminosidad y suavidad a tu rostro.",                                                        thumbnail: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80", precio: 0, duracion: 0, categoria: "Facial",      orden: 1 },
  { title: "Lifting de Pestañas",   description: "Realza tu mirada con un efecto curvado natural y duradero. Sin extensiones, sin mantenimiento diario.",                                                           thumbnail: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=600&q=80", precio: 0, duracion: 0, categoria: "Pestañas",   orden: 2 },
  { title: "Hidratación Facial",    description: "Restaura la hidratación profunda de tu piel con activos premium que la dejan radiante, elástica y suave.",                                                        thumbnail: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80", precio: 0, duracion: 0, categoria: "Facial",      orden: 3 },
  { title: "Tratamientos Faciales", description: "Protocolos personalizados anti-edad, despigmentantes y revitalizantes para resultados visibles desde la primera sesión.",                                         thumbnail: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80", precio: 0, duracion: 0, categoria: "Tratamiento", orden: 4 },
  { title: "Skincare Premium",      description: "Selección curada de cosmética profesional para que tu rutina en casa potencie los resultados de cada tratamiento.",                                               thumbnail: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80", precio: 0, duracion: 0, categoria: "Skincare",    orden: 5 },
  { title: "Ritual de Bienestar",   description: "Una experiencia completa de relajación y cuidado: masaje facial, aromaterapia y un mimo de pies a cabeza.",                                                      thumbnail: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80", precio: 0, duracion: 0, categoria: "Bienestar",   orden: 6 },
];

export async function GET() {
  try {
    await ensureServiciosTable();
    const sql = getDb();

    const existing = await sql`SELECT COUNT(*) as count FROM servicios`;
    const count = Number((existing[0] as { count: string }).count);

    if (count > 0) {
      return NextResponse.json({ ok: true, message: `Ya hay ${count} servicios. No se sobreescribió nada.` });
    }

    for (const s of SERVICIOS_INICIALES) {
      await sql`
        INSERT INTO servicios (title, description, thumbnail, status, precio, duracion, categoria, orden)
        VALUES (${s.title}, ${s.description}, ${s.thumbnail}, 'published', ${s.precio}, ${s.duracion}, ${s.categoria}, ${s.orden})
      `;
    }

    return NextResponse.json({ ok: true, message: `${SERVICIOS_INICIALES.length} servicios creados.` });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
