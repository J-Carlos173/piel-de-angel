export const dynamic = "force-dynamic";

import { getConfirmedOrders } from "@/lib/db";
import { countTareasPendientes } from "@/lib/tareas-db";
import DashboardClient from "./DashboardClient";

export default async function AdminPage() {
  const orders = (await getConfirmedOrders()) as Record<string, unknown>[];

  const totalRevenue = orders.reduce((s, o) => s + (Number(o.amount) || Number(o.total) || 0), 0);
  const now = new Date();
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.confirmed_at as string);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthRevenue = thisMonth.reduce((s, o) => s + (Number(o.amount) || Number(o.total) || 0), 0);

  let tareasPendientes = 0;
  try {
    tareasPendientes = await countTareasPendientes();
  } catch {}

  return (
    <DashboardClient
      totalOrders={orders.length}
      totalRevenue={totalRevenue}
      thisMonthOrders={thisMonth.length}
      thisMonthRevenue={thisMonthRevenue}
      tareasPendientes={tareasPendientes}
    />
  );
}
