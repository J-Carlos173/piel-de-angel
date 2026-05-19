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

  return (
    <AnalyticsClient
      daily={daily as { date: string; views: number }[]}
      topPages={topPages as { path: string; views: number }[]}
      today={stats.today ?? 0}
      week={stats.week ?? 0}
      month={stats.month ?? 0}
      total={stats.total ?? 0}
    />
  );
}
