export const dynamic = "force-dynamic";

import { getDb } from "@/lib/db";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const sql = getDb();

  // Aseguramos que la tabla existe
  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id    SERIAL PRIMARY KEY,
      path  TEXT NOT NULL,
      date  DATE NOT NULL DEFAULT CURRENT_DATE,
      views INT  NOT NULL DEFAULT 0,
      UNIQUE (path, date)
    )
  `.catch(() => {});

  // Visitas diarias últimos 30 días (zona Chile)
  const daily = await sql`
    SELECT date::text, SUM(views)::int AS views
    FROM page_views
    WHERE date >= (NOW() AT TIME ZONE 'America/Santiago')::date - INTERVAL '30 days'
    GROUP BY date
    ORDER BY date ASC
  `.catch(() => []);

  // Top páginas total
  const topPages = await sql`
    SELECT path, SUM(views)::int AS views
    FROM page_views
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `.catch(() => []);

  // Totales usando fecha Chile
  const totals = await sql`
    SELECT
      SUM(views) FILTER (WHERE date = (NOW() AT TIME ZONE 'America/Santiago')::date)::int                                       AS today,
      SUM(views) FILTER (WHERE date >= (NOW() AT TIME ZONE 'America/Santiago')::date - 6)::int                                  AS week,
      SUM(views) FILTER (WHERE date >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Santiago')::date)::int                   AS month,
      SUM(views)::int                                                                                                            AS total
    FROM page_views
  `.catch(() => [{}]);

  const stats = (totals[0] as Record<string, number>) ?? {};

  // Clics en WhatsApp (la tabla la crea /api/track/clic al primer clic; si aún no existe, queda en 0)
  const waTotales = await sql`
    SELECT
      SUM(clics) FILTER (WHERE date = (NOW() AT TIME ZONE 'America/Santiago')::date)::int                    AS today,
      SUM(clics) FILTER (WHERE date >= (NOW() AT TIME ZONE 'America/Santiago')::date - 6)::int               AS week,
      SUM(clics) FILTER (WHERE date >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Santiago')::date)::int AS month,
      SUM(clics)::int                                                                                         AS total
    FROM clics_whatsapp
  `.catch(() => [{}]);
  const waStats = (waTotales[0] as Record<string, number>) ?? {};

  const waPorPagina = await sql`
    SELECT path, origen, SUM(clics)::int AS clics
    FROM clics_whatsapp
    GROUP BY path, origen
    ORDER BY clics DESC
    LIMIT 10
  `.catch(() => []);

  return (
    <AnalyticsClient
      wa={{
        today: waStats.today ?? 0,
        week: waStats.week ?? 0,
        month: waStats.month ?? 0,
        total: waStats.total ?? 0,
        porPagina: waPorPagina as { path: string; origen: string; clics: number }[],
      }}
      daily={daily as { date: string; views: number }[]}
      topPages={topPages as { path: string; views: number }[]}
      today={stats.today ?? 0}
      week={stats.week ?? 0}
      month={stats.month ?? 0}
      total={stats.total ?? 0}
    />
  );
}
