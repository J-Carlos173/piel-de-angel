import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

// Lectura para el monitor local de Carlos (Desktop\Web\monitor-webs): visitas, clics en WhatsApp
// y compras de los últimos 30 días. Solo lectura y sin datos personales (ni nombre, correo,
// teléfono ni dirección de quien compra). Entra con el token MONITOR_TOKEN o con la sesión del panel.

export const dynamic = "force-dynamic";

function tokenValido(req: NextRequest) {
  const esperado = process.env.MONITOR_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!esperado || esperado.length < 32 || !auth.startsWith("Bearer ")) return false;
  const a = createHash("sha256").update(auth.slice(7)).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!tokenValido(req) && !isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const sql = getDb();
  const [visitas, clics, compras] = await Promise.all([
    sql`SELECT date::text AS dia, path AS ruta, views::int AS n FROM page_views WHERE date >= (NOW() AT TIME ZONE 'America/Santiago')::date - 30`.catch(() => []),
    sql`SELECT date::text AS dia, path AS ruta, origen, clics::int AS n FROM clics_whatsapp WHERE date >= (NOW() AT TIME ZONE 'America/Santiago')::date - 30`.catch(() => []),
    sql`
      SELECT buy_order, status, total, zona, customer_ciudad, items, created_at, confirmed_at
      FROM orders WHERE created_at >= NOW() - INTERVAL '30 days' ORDER BY created_at
    `.catch(() => []),
  ]);

  return NextResponse.json(
    {
      sitio: "pieldeangel",
      ahora: new Date().toISOString(),
      visitas,
      clics,
      compras: (compras as Record<string, unknown>[]).map((o) => ({
        id: o.buy_order,
        estado: o.status,
        total: o.total,
        zona: o.zona,
        ciudad: o.customer_ciudad,
        productos: Array.isArray(o.items)
          ? (o.items as { nombre?: string; qty?: number }[]).map((i) => ({ nombre: i.nombre ?? "", qty: i.qty ?? 1 }))
          : [],
        creado: o.created_at,
        confirmado: o.confirmed_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
