export const dynamic = "force-dynamic";

import { getConfirmedOrders } from "@/lib/db";
import VentasClient from "./VentasClient";

export default async function VentasPage() {
  const raw = (await getConfirmedOrders()) as Record<string, unknown>[];

  // Ingresos por zona
  const byZona: Record<string, number> = {};
  // Ingresos por producto
  const byProduct: Record<string, number> = {};
  // Ingresos por mes (últimos 6)
  const byMonth: Record<string, number> = {};

  for (const o of raw) {
    const amount = Number(o.amount) || Number(o.total) || 0;
    const zona = (o.zona as string) === "santiago" ? "Santiago (RM)" : "Regiones";
    byZona[zona] = (byZona[zona] || 0) + amount;

    const date = new Date((o.confirmed_at || o.created_at) as string);
    const monthKey = date.toLocaleString("es-CL", { month: "short", year: "2-digit", timeZone: "America/Santiago" });
    byMonth[monthKey] = (byMonth[monthKey] || 0) + amount;

    const items = Array.isArray(o.items) ? o.items as { nombre: string; precio: number; qty: number }[] : [];
    for (const item of items) {
      byProduct[item.nombre] = (byProduct[item.nombre] || 0) + item.precio * item.qty;
    }
  }

  // Top 6 productos
  const topProducts = Object.entries(byProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Últimos 6 meses en orden
  const monthData = Object.entries(byMonth)
    .slice(-6)
    .map(([name, value]) => ({ name, value }));

  const zonaData = Object.entries(byZona).map(([name, value]) => ({ name, value }));

  return <VentasClient zonaData={zonaData} productData={topProducts} monthData={monthData} totalOrders={raw.length} />;
}
