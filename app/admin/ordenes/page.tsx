export const dynamic = "force-dynamic";

import { getAllOrders } from "@/lib/db";

function fmtPrecio(n: number) {
  return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fmtFecha(d: Date | string) {
  const date = new Date(d);
  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

type Order = {
  buy_order: string;
  status: string;
  customer_nombre: string;
  customer_email: string;
  customer_tel: string;
  customer_dir: string;
  customer_depto: string;
  customer_ciudad: string;
  customer_region: string;
  zona: string;
  items: { nombre: string; precio: number; qty: number }[] | null;
  subtotal: number;
  envio: number;
  total: number;
  amount: number;
  auth_code: string;
  card_last4: string;
  created_at: string;
  confirmed_at: string | null;
};

export default async function OrdenesPage() {
  let orders: Order[] = [];
  let error = "";

  try {
    const rows = await getAllOrders();
    orders = rows as Order[];
  } catch (err) {
    error = String(err);
  }

  const confirmed = orders.filter((o) => o.status === "confirmed");
  const pending = orders.filter((o) => o.status === "pending");
  const totalVentas = confirmed.reduce((s, o) => s + (o.amount || o.total || 0), 0);

  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 1000, margin: "0 auto", padding: "32px 16px", color: "#333" }}>
      <h1 style={{ color: "#8B6F6F", marginBottom: 4 }}>Historial de Órdenes</h1>
      <p style={{ color: "#888", marginTop: 0, marginBottom: 32 }}>Piel de Ángel · Panel interno</p>

      {error && (
        <div style={{ background: "#ffe4e4", border: "1px solid #f5c6c6", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <strong>Error al cargar órdenes:</strong> {error}
        </div>
      )}

      {/* Resumen */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140, background: "#fdf9f7", border: "1.5px solid #e8d5cc", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Ventas confirmadas</p>
          <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: "bold", color: "#C68A95" }}>{confirmed.length}</p>
        </div>
        <div style={{ flex: 1, minWidth: 140, background: "#fdf9f7", border: "1.5px solid #e8d5cc", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total recaudado</p>
          <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: "bold", color: "#C68A95" }}>{fmtPrecio(totalVentas)}</p>
        </div>
        <div style={{ flex: 1, minWidth: 140, background: "#fdf9f7", border: "1.5px solid #e8d5cc", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Pendientes</p>
          <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: "bold", color: "#d4a843" }}>{pending.length}</p>
        </div>
      </div>

      {orders.length === 0 && !error && (
        <p style={{ color: "#aaa" }}>No hay órdenes aún.</p>
      )}

      {orders.map((order) => {
        const isConfirmed = order.status === "confirmed";
        const direccion = [order.customer_dir, order.customer_depto, order.customer_ciudad, order.customer_region]
          .filter(Boolean)
          .join(", ");

        return (
          <div
            key={order.buy_order}
            style={{
              background: "#fff",
              border: `1.5px solid ${isConfirmed ? "#e8d5cc" : "#f0e0a0"}`,
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 16,
            }}
          >
            {/* Cabecera */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <span style={{ fontWeight: "bold", color: "#C68A95", fontSize: 16 }}>{order.buy_order}</span>
                <span
                  style={{
                    marginLeft: 12,
                    padding: "2px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: "bold",
                    background: isConfirmed ? "#e8f5e9" : "#fff8e1",
                    color: isConfirmed ? "#388e3c" : "#f9a825",
                    textTransform: "uppercase",
                  }}
                >
                  {isConfirmed ? "Pagado" : "Pendiente"}
                </span>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: "#888" }}>
                <div>{fmtFecha(order.created_at)}</div>
                {order.confirmed_at && (
                  <div style={{ color: "#4caf50" }}>Pagado: {fmtFecha(order.confirmed_at)}</div>
                )}
              </div>
            </div>

            {/* Dos columnas */}
            <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
              {/* Cliente */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em" }}>Cliente</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>{order.customer_nombre}</p>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#666" }}>{order.customer_email}</p>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#666" }}>{order.customer_tel}</p>
                {direccion && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>{direccion}</p>}
                {order.zona && (
                  <p style={{ margin: "2px 0", fontSize: 12, color: "#aaa" }}>
                    Zona: {order.zona === "santiago" ? "Santiago (RM)" : "Regiones"}
                  </p>
                )}
              </div>

              {/* Productos */}
              <div style={{ flex: 2, minWidth: 240 }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: ".06em" }}>Productos</p>
                {order.items && order.items.length > 0 ? (
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f5eded" }}>
                          <td style={{ padding: "4px 0", color: "#444" }}>
                            {item.nombre} <span style={{ color: "#aaa" }}>×{item.qty}</span>
                          </td>
                          <td style={{ padding: "4px 0", textAlign: "right", color: "#444" }}>
                            {fmtPrecio(item.precio * item.qty)}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: "6px 0", color: "#888", fontSize: 12 }}>Envío</td>
                        <td style={{ padding: "6px 0", textAlign: "right", color: "#888", fontSize: 12 }}>
                          {order.envio === 0 ? "Gratis" : fmtPrecio(order.envio)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "4px 0", fontWeight: "bold" }}>Total</td>
                        <td style={{ padding: "4px 0", textAlign: "right", fontWeight: "bold", color: "#C68A95", fontSize: 16 }}>
                          {fmtPrecio(order.amount || order.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: 13, color: "#aaa" }}>Sin detalle de productos</p>
                )}
                {order.auth_code && (
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "#aaa" }}>
                    Auth: {order.auth_code} · Tarjeta: **** {order.card_last4}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
