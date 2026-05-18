"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

function fmtPrecio(n: number) {
  return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtFecha(d: string) {
  return new Date(d).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago",
  });
}

export type Order = {
  buy_order: string; status: string;
  customer_nombre: string; customer_email: string; customer_tel: string;
  customer_dir: string; customer_depto: string; customer_ciudad: string; customer_region: string;
  zona: string; items: { nombre: string; precio: number; qty: number }[] | null;
  subtotal: number; envio: number; total: number; amount: number;
  auth_code: string; card_last4: string; created_at: string; confirmed_at: string | null;
};

function exportCSV(orders: Order[]) {
  const rows = [
    ["Orden", "Estado", "Fecha", "Nombre", "Email", "Teléfono", "Dirección", "Zona", "Productos", "Envío", "Total", "Auth", "Tarjeta"],
    ...orders.map((o) => [
      o.buy_order, o.status === "confirmed" ? "Pagado" : "Pendiente",
      fmtFecha(o.created_at), o.customer_nombre, o.customer_email, o.customer_tel,
      [o.customer_dir, o.customer_depto, o.customer_ciudad, o.customer_region].filter(Boolean).join(" "),
      o.zona === "santiago" ? "Santiago" : "Regiones",
      (o.items || []).map((i) => `${i.nombre} x${i.qty}`).join(" | "),
      o.envio === 0 ? "Gratis" : String(o.envio),
      String(o.amount || o.total), o.auth_code, o.card_last4,
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function isInPeriod(dateStr: string, period: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === "today") return d.toDateString() === now.toDateString();
  if (period === "week") { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
  if (period === "month") { const m = new Date(now); m.setDate(now.getDate() - 30); return d >= m; }
  return true;
}

export default function OrdenesClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodoFilter, setPeriodoFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sheetsLoading, setSheetsLoading] = useState(false);

  async function handleExportSheets() {
    setSheetsLoading(true);
    try {
      const res = await fetch("/api/admin/export-sheets", { method: "POST" });
      const data = await res.json();
      if (data.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("Error al exportar: " + (data.error || "desconocido"));
      }
    } catch {
      alert("Error de conexión al exportar");
    }
    setSheetsLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) =>
        o.buy_order.toLowerCase().includes(q) ||
        (o.customer_nombre || "").toLowerCase().includes(q) ||
        (o.customer_email || "").toLowerCase().includes(q) ||
        (o.customer_tel || "").includes(q)
      );
    }
    if (statusFilter !== "all") result = result.filter((o) => o.status === statusFilter);
    if (periodoFilter !== "all") result = result.filter((o) => isInPeriod(o.created_at, periodoFilter));
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "amount_desc") return (b.amount || b.total) - (a.amount || a.total);
      if (sortBy === "amount_asc") return (a.amount || a.total) - (b.amount || b.total);
      return 0;
    });
    return result;
  }, [orders, search, statusFilter, periodoFilter, sortBy]);

  const confirmedFiltered = filtered.filter((o) => o.status === "confirmed");
  const totalFiltrado = confirmedFiltered.reduce((s, o) => s + (o.amount || o.total || 0), 0);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13,
    outline: "none", fontFamily: "Georgia, serif",
  };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer", appearance: "none" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f0ee", fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #8B6F6F 0%, #C68A95 60%, #D8A7B1 100%)", padding: "36px 32px 28px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Panel interno</p>
              <h1 style={{ margin: "6px 0 2px", color: "#fff", fontSize: 28, fontWeight: "normal" }}>Historial de Órdenes</h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Piel de Ángel · Estética & Skincare Premium</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => exportCSV(filtered)}
                style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 10, padding: "10px 18px", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 8 }}
              >
                <i className="fa-solid fa-file-csv" /> CSV ({filtered.length})
              </button>
              <button
                onClick={handleExportSheets}
                disabled={sheetsLoading}
                style={{ background: sheetsLoading ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 10, padding: "10px 18px", color: "#fff", fontSize: 13, cursor: sheetsLoading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 8 }}
              >
                {sheetsLoading
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Creando…</>
                  : <><i className="fa-brands fa-google" /> Google Sheets</>}
              </button>
              <button
                onClick={handleLogout}
                style={{ background: "rgba(0,0,0,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "10px 16px", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 8 }}
              >
                <i className="fa-solid fa-right-from-bracket" /> Salir
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 2, minWidth: 200 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)", fontSize: 13 }} />
              <input
                type="text" placeholder="Buscar por nombre, email, teléfono u orden…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, width: "100%", paddingLeft: 36, boxSizing: "border-box" }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: 130 }}>
              <option value="all">Todos los estados</option>
              <option value="confirmed">Solo pagados</option>
              <option value="pending">Solo pendientes</option>
            </select>
            <select value={periodoFilter} onChange={(e) => setPeriodoFilter(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: 130 }}>
              <option value="all">Todo el tiempo</option>
              <option value="today">Hoy</option>
              <option value="week">Últimos 7 días</option>
              <option value="month">Últimos 30 días</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: 150 }}>
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguos primero</option>
              <option value="amount_desc">Mayor monto primero</option>
              <option value="amount_asc">Menor monto primero</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 48px" }}>

        {/* Resumen */}
        <div style={{ display: "flex", gap: 14, margin: "24px 0", flexWrap: "wrap" }}>
          {[
            { icon: "fa-circle-check", label: "Confirmadas", value: confirmedFiltered.length, color: "#C68A95" },
            { icon: "fa-sack-dollar", label: "Total recaudado", value: fmtPrecio(totalFiltrado), color: "#C68A95" },
            { icon: "fa-clock", label: "Pendientes", value: filtered.filter(o => o.status === "pending").length, color: "#e0a800" },
            { icon: "fa-filter", label: "Mostrando", value: filtered.length, color: "#8B6F6F" },
          ].map((card) => (
            <div key={card.label} style={{ flex: 1, minWidth: 130, background: "#fff", borderRadius: 14, padding: "18px 20px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #ecddd9" }}>
              <i className={`fa-solid ${card.icon}`} style={{ fontSize: 20, color: card.color, marginBottom: 6, display: "block" }} />
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.1em" }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: "bold", color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#ccc" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 40, marginBottom: 12, display: "block" }} />
            <p style={{ margin: 0, fontSize: 15 }}>No se encontraron órdenes con ese criterio.</p>
          </div>
        )}

        {/* Órdenes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((order) => {
            const isConfirmed = order.status === "confirmed";
            const isOpen = expanded === order.buy_order;
            const direccion = [order.customer_dir, order.customer_depto, order.customer_ciudad, order.customer_region].filter(Boolean).join(", ");
            const itemTotal = order.amount || order.total;

            return (
              <div key={order.buy_order} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 14px rgba(0,0,0,0.06)", border: `1.5px solid ${isConfirmed ? "#ecddd9" : "#f5e6a0"}`, overflow: "hidden" }}>

                {/* Fila compacta (siempre visible) */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.buy_order)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 24px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", textAlign: "left", fontFamily: "Georgia, serif" }}
                >
                  <i className={`fa-solid ${isConfirmed ? "fa-circle-check" : "fa-clock"}`} style={{ color: isConfirmed ? "#4caf50" : "#e0a800", fontSize: 16, flexShrink: 0 }} />
                  <span style={{ fontWeight: "bold", color: "#C68A95", fontSize: 15, minWidth: 180 }}>{order.buy_order}</span>
                  <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: "bold", background: isConfirmed ? "#e8f5e9" : "#fff8e1", color: isConfirmed ? "#388e3c" : "#f9a825", textTransform: "uppercase" }}>
                    {isConfirmed ? "Pagado" : "Pendiente"}
                  </span>
                  <span style={{ color: "#888", fontSize: 13, flex: 1 }}>{order.customer_nombre || "—"}</span>
                  <span style={{ fontWeight: "bold", color: "#C68A95", fontSize: 17, marginLeft: "auto" }}>{fmtPrecio(itemTotal)}</span>
                  <span style={{ color: "#aaa", fontSize: 12, minWidth: 130, textAlign: "right" }}>{fmtFecha(order.created_at)}</span>
                  <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"}`} style={{ color: "#ccc", fontSize: 12, flexShrink: 0 }} />
                </button>

                {/* Detalle expandible */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #f0e8e4", display: "flex", flexWrap: "wrap" }}>

                    {/* Cliente */}
                    <div style={{ flex: "0 0 260px", padding: "20px 24px", borderRight: "1px solid #f0e8e4" }}>
                      <p style={{ margin: "0 0 12px", fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        <i className="fa-solid fa-user" style={{ marginRight: 6 }} />Cliente
                      </p>
                      <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: "bold", color: "#333" }}>{order.customer_nombre || "—"}</p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}><i className="fa-regular fa-envelope" style={{ marginRight: 6, width: 14 }} />{order.customer_email}</p>
                      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}><i className="fa-solid fa-phone" style={{ marginRight: 6, width: 14 }} />{order.customer_tel}</p>
                      {direccion && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#aaa", lineHeight: 1.5 }}><i className="fa-solid fa-location-dot" style={{ marginRight: 6 }} />{direccion}</p>}
                      {order.zona && (
                        <span style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", background: "#f7f0ee", borderRadius: 20, fontSize: 11, color: "#8B6F6F" }}>
                          <i className="fa-solid fa-truck" style={{ marginRight: 4 }} />
                          {order.zona === "santiago" ? "Santiago (RM)" : "Regiones"}
                        </span>
                      )}
                    </div>

                    {/* Productos */}
                    <div style={{ flex: 1, minWidth: 240, padding: "20px 24px" }}>
                      <p style={{ margin: "0 0 12px", fontSize: 10, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        <i className="fa-solid fa-bag-shopping" style={{ marginRight: 6 }} />Productos
                      </p>
                      {order.items && order.items.length > 0 ? (
                        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                          <tbody>
                            {order.items.map((item, i) => (
                              <tr key={i} style={{ borderBottom: "1px solid #f7f0ee" }}>
                                <td style={{ padding: "6px 0", color: "#444" }}>{item.nombre} <span style={{ color: "#ccc" }}>×{item.qty}</span></td>
                                <td style={{ padding: "6px 0", textAlign: "right", color: "#666" }}>{fmtPrecio(item.precio * item.qty)}</td>
                              </tr>
                            ))}
                            <tr style={{ borderTop: "1px solid #ecddd9" }}>
                              <td style={{ padding: "6px 0", color: "#aaa", fontSize: 12 }}>Envío</td>
                              <td style={{ padding: "6px 0", textAlign: "right", color: "#aaa", fontSize: 12 }}>{order.envio === 0 ? "Gratis" : fmtPrecio(order.envio)}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: "6px 0", fontWeight: "bold", color: "#333" }}>Total</td>
                              <td style={{ padding: "6px 0", textAlign: "right", fontWeight: "bold", fontSize: 20, color: "#C68A95" }}>{fmtPrecio(itemTotal)}</td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ color: "#ccc", fontStyle: "italic", fontSize: 13 }}>Sin detalle</p>
                      )}
                      {order.auth_code && (
                        <p style={{ margin: "12px 0 0", fontSize: 11, color: "#ddd" }}>
                          <i className="fa-solid fa-credit-card" style={{ marginRight: 6 }} />
                          **** {order.card_last4} · Auth: {order.auth_code}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
