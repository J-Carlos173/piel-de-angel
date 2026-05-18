export const dynamic = "force-dynamic";

import { getAllOrders } from "@/lib/db";
import OrdenesClient, { Order } from "./OrdenesClient";

export default async function OrdenesPage() {
  let orders: Order[] = [];
  let error = "";
  try {
    const rows = await getAllOrders();
    orders = rows as Order[];
  } catch (err) {
    error = String(err);
  }

  if (error) {
    return (
      <div style={{ padding: 32, fontFamily: "Georgia, serif", color: "#c0392b" }}>
        <strong>Error al cargar órdenes:</strong> {error}
      </div>
    );
  }

  return <OrdenesClient orders={orders} />;
}
