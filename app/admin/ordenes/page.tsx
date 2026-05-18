export const dynamic = "force-dynamic";

import { getAllOrders } from "@/lib/db";

function fmtPrecio(n: number) {
  return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function fmtFecha(d: Date | string) {
  return new Date(d).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

type Order = {
  buy_order: string; status: string;
  customer_nombre: string; customer_email: string; customer_tel: string;
  customer_dir: string; customer_depto: string; customer_ciudad: string; customer_region: string;
  zona: string; items: { nombre: string; precio: number; qty: number }[] | null;
  subtotal: number; envio: number; total: number; amount: number;
  auth_code: string; card_last4: string; created_at: string; confirmed_at: string | null;
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
    <div style={{ minHeight: "100vh", background: "#f7f0ee", fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #8B6F6F 0%, #C68A95 60%, #D8A7B1 100%)", padding: "40px 32px 32px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Panel interno</p>
        <h1 style={{ margin: "8px 0 4px", color: "#fff", fontSize: 30, fontWeight: "normal" }}>Historial de Órdenes</h1>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Piel de Ángel · Estética & Skincare Premium</p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 48px" }}>

        {error && (
          <div style={{ margin: "24px 0", background: "#ffe4e4", border: "1px solid #f5c6c6", borderRadius: 10, padding: "14px 20px", color: "#c0392b", fontSize: 14 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Tarjetas resumen */}
        <div style={{ display: "flex", gap: 16, margin: "28px 0", flexWrap: "wrap" }}>
          {[
            { icon: "fa-circle-check", label: "Ventas confirmadas", value: confirmed.length, color: "#C68A95", bg: "#fff" },
            { icon: "fa-sack-dollar", label: "Total recaudado", value: fmtPrecio(totalVentas), color: "#C68A95", bg: "#fff" },
            { icon: "fa-clock", label: "Pendientes", value: pending.length, color: "#e0a800", bg: "#fff" },
          ].map((card) => (
            <div key={card.label} style={{ flex: 1, minWidth: 160, background: card.bg, borderRadius: 14, padding: "20px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #ecddd9" }}>
              <i className={`fa-solid ${card.icon}`} style={{ fontSize: 22, color: card.color, marginBottom: 8, display: "block" }} />
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: "bold", color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {orders.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
            <i className="fa-solid fa-bag-shopping" style={{ fontSize: 48, marginBottom: 16, display: "block" }} />
            <p style={{ margin: 0, fontSize: 16 }}>Aún no hay órdenes registradas.</p>
          </div>
        )}

        {/* Lista de órdenes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((order) => {
            const isConfirmed = order.status === "confirmed";
            const direccion = [order.customer_dir, order.customer_depto, order.customer_ciudad, order.customer_region].filter(Boolean).join(", ");
            const itemTotal = order.amount || order.total;

            return (
              <div key={order.buy_order} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: `1.5px solid ${isConfirmed ? "#ecddd9" : "#f5e6a0"}`, overflow: "hidden" }}>

                {/* Cabecera de la orden */}
                <div style={{ background: isConfirmed ? "linear-gradient(90deg, #fdf9f7, #fff)" : "#fffdf0", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, borderBottom: "1px solid #f0e8e4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <i className={`fa-solid ${isConfirmed ? "fa-circle-check" : "fa-clock"}`} style={{ color: isConfirmed ? "#4caf50" : "#e0a800", fontSize: 18 }} />
                    <span style={{ fontWeight: "bold", color: "#C68A95", fontSize: 17, letterSpacing: "0.02em" }}>{order.buy_order}</span>
                    <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: isConfirmed ? "#e8f5e9" : "#fff8e1", color: isConfirmed ? "#388e3c" : "#f9a825", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {isConfirmed ? "Pagado" : "Pendiente"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
                    <div><i className="fa-regular fa-calendar" style={{ marginRight: 4 }} />{fmtFecha(order.created_at)}</div>
                    {order.confirmed_at && (
                      <div style={{ color: "#4caf50" }}><i className="fa-solid fa-check" style={{ marginRight: 4 }} />Pagado: {fmtFecha(order.confirmed_at)}</div>
                    )}
                  </div>
                </div>

                {/* Cuerpo */}
                <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>

                  {/* Cliente */}
                  <div style={{ flex: "0 0 260px", padding: "20px 24px", borderRight: "1px solid #f0e8e4" }}>
                    <p style={{ margin: "0 0 12px", fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif" }}>
                      <i className="fa-solid fa-user" style={{ marginRight: 6 }} />Cliente
                    </p>
                    <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: "bold", color: "#333" }}>{order.customer_nombre || "—"}</p>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}><i className="fa-regular fa-envelope" style={{ marginRight: 6, width: 14 }} />{order.customer_email}</p>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}><i className="fa-solid fa-phone" style={{ marginRight: 6, width: 14 }} />{order.customer_tel}</p>
                    {direccion && (
                      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                        <i className="fa-solid fa-location-dot" style={{ marginRight: 6, width: 14 }} />{direccion}
                      </p>
                    )}
                    {order.zona && (
                      <span style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", background: "#f7f0ee", borderRadius: 20, fontSize: 11, color: "#8B6F6F", fontFamily: "sans-serif" }}>
                        <i className="fa-solid fa-truck" style={{ marginRight: 4 }} />
                        {order.zona === "santiago" ? "Santiago (RM)" : "Regiones"}
                      </span>
                    )}
                  </div>

                  {/* Productos */}
                  <div style={{ flex: 1, minWidth: 240, padding: "20px 24px" }}>
                    <p style={{ margin: "0 0 12px", fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif" }}>
                      <i className="fa-solid fa-bag-shopping" style={{ marginRight: 6 }} />Productos
                    </p>

                    {order.items && order.items.length > 0 ? (
                      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                        <tbody>
                          {order.items.map((item, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f7f0ee" }}>
                              <td style={{ padding: "6px 0", color: "#444" }}>
                                {item.nombre}
                                <span style={{ marginLeft: 6, color: "#ccc", fontFamily: "sans-serif" }}>×{item.qty}</span>
                              </td>
                              <td style={{ padding: "6px 0", textAlign: "right", color: "#666", fontFamily: "sans-serif" }}>
                                {fmtPrecio(item.precio * item.qty)}
                              </td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: "1px solid #ecddd9" }}>
                            <td style={{ padding: "6px 0", color: "#aaa", fontSize: 12, fontFamily: "sans-serif" }}>Envío</td>
                            <td style={{ padding: "6px 0", textAlign: "right", color: "#aaa", fontSize: 12, fontFamily: "sans-serif" }}>
                              {order.envio === 0 ? "Gratis" : fmtPrecio(order.envio)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: "8px 0 4px", fontWeight: "bold", color: "#333", fontSize: 14 }}>Total</td>
                            <td style={{ padding: "8px 0 4px", textAlign: "right", fontWeight: "bold", fontSize: 20, color: "#C68A95", fontFamily: "sans-serif" }}>
                              {fmtPrecio(itemTotal)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <p style={{ fontSize: 13, color: "#ccc", fontStyle: "italic" }}>Sin detalle de productos</p>
                    )}

                    {order.auth_code && (
                      <p style={{ margin: "12px 0 0", fontSize: 11, color: "#ddd", fontFamily: "sans-serif" }}>
                        <i className="fa-solid fa-credit-card" style={{ marginRight: 6 }} />
                        **** {order.card_last4} · Auth: {order.auth_code}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
