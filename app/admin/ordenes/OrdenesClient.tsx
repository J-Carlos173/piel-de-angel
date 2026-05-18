"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

const MONO: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontVariantNumeric: "tabular-nums",
};

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
  const { dark, toggle } = useThemeStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [periodoFilter, setPeriodoFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [sheetsLoading, setSheetsLoading] = useState(false);

  async function handleExportSheets() {
    setSheetsLoading(true);
    try {
      const res = await fetch("/api/admin/export-sheets", { method: "POST" });
      if (!res.ok) throw new Error("Error " + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ordenes-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
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

  // Tema
  const bg          = dark ? "#160f13" : "#f5eeec";
  const cardBg      = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const cardBorder  = dark ? "#3a2830" : "#ecddd9";
  const textMain    = dark ? "#f0dde6" : "#2e1e24";
  const textMuted   = dark ? "#9a7c86" : "#9a8486";
  const inputBg     = dark ? "#231620" : "#fff";
  const inputBorder = dark ? "#4a3040" : "#e5d0cc";

  const glassBtn: React.CSSProperties = {
    background: dark ? "rgba(91,126,100,0.20)" : "rgba(91,126,100,0.10)",
    border: `1.5px solid ${dark ? "#3a5540" : "#c5dcc6"}`,
    borderRadius: 12, padding: "9px 16px",
    color: dark ? "#a8d4a8" : "#4A6B52", fontSize: 13, cursor: "pointer",
    fontFamily: "Montserrat, sans-serif", fontWeight: 500,
    display: "flex", alignItems: "center", gap: 7,
    transition: "background 0.18s, border-color 0.18s",
    letterSpacing: "0.02em",
  };

  const selStyle: React.CSSProperties = {
    background: inputBg, border: `1.5px solid ${inputBorder}`,
    borderRadius: 10, padding: "9px 14px",
    color: textMain, fontSize: 13, outline: "none",
    fontFamily: "Montserrat, sans-serif", cursor: "pointer",
    flex: 1, minWidth: 130,
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Georgia, serif", transition: "background 0.3s" }}>

      {/* ── Header ── */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1a2620 0%, #1e2e24 55%, #16231a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #f6fbf7 60%, #eef7ef 100%)",
        padding: "36px 32px 32px", position: "relative", overflow: "hidden",
        borderBottom: dark ? "1.5px solid #3a5540" : "1.5px solid #c5dcc6",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #7FA882, #5B7E64, #7FA882, transparent)" }} />
        <svg aria-hidden style={{ position: "absolute", right: 0, top: -8, opacity: dark ? 0.07 : 0.08, width: 160, pointerEvents: "none" }} viewBox="0 0 220 320">
          <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#4A6B52"/>
          <path d="M110,10 C105,80 108,175 108,268" stroke="#2E4D35" strokeWidth="2" fill="none" opacity={0.4}/>
          <path d="M110,50 C140,65 175,60 200,50" stroke="#2E4D35" strokeWidth="1" fill="none" opacity={0.3}/>
        </svg>

        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, position: "relative" }}>
          <div>
            <p style={{ margin: 0, color: dark ? "rgba(127,168,130,0.65)" : "#7A9E8A", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Panel interno · Piel de Ángel</p>
            <h1 style={{ margin: "8px 0 3px", color: dark ? "#d4e8d6" : "#2e1e24", fontSize: 28, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Historial de Órdenes</h1>
            <p style={{ margin: 0, color: dark ? "rgba(127,168,130,0.50)" : "#9a8486", fontSize: 12, letterSpacing: "0.05em" }}>Estética & Skincare Premium</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={toggle} title={dark ? "Modo claro" : "Modo oscuro"}
              style={{ ...glassBtn, padding: "9px 13px", fontSize: 15 }}>
              <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
            </button>
            <button onClick={() => exportCSV(filtered)} style={glassBtn}>
              <i className="fa-solid fa-file-csv" />
              <span>CSV ({filtered.length})</span>
            </button>
            <button onClick={handleExportSheets} disabled={sheetsLoading}
              style={{ ...glassBtn, opacity: sheetsLoading ? 0.7 : 1, cursor: sheetsLoading ? "not-allowed" : "pointer" }}>
              {sheetsLoading
                ? <><i className="fa-solid fa-spinner fa-spin" /><span>Descargando…</span></>
                : <><i className="fa-solid fa-file-excel" /><span>Excel</span></>}
            </button>
            <button onClick={() => setExpanded(new Set(filtered.map(o => o.buy_order)))}
              title="Expandir todo" style={{ ...glassBtn, padding: "9px 13px" }}>
              <i className="fa-solid fa-angles-down" />
            </button>
            <button onClick={() => setExpanded(new Set())}
              title="Colapsar todo" style={{ ...glassBtn, padding: "9px 13px" }}>
              <i className="fa-solid fa-angles-up" />
            </button>
            <button onClick={handleLogout}
              style={{ ...glassBtn, background: dark ? "rgba(198,138,149,0.15)" : "rgba(198,138,149,0.10)", border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`, color: dark ? "#e8b4bc" : "#C68A95" }}>
              <i className="fa-solid fa-right-from-bracket" /><span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Barra de filtros ── */}
      <div style={{
        background: dark ? "rgba(22,15,19,0.98)" : "rgba(255,255,255,0.98)",
        borderBottom: `1px solid ${cardBorder}`,
        padding: "13px 32px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 2, minWidth: 220 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textMuted, fontSize: 13 }} />
            <input type="text" placeholder="Buscar por nombre, email, teléfono u orden…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ background: inputBg, border: `1.5px solid ${inputBorder}`, borderRadius: 10, padding: "9px 12px 9px 36px", color: textMain, fontSize: 13, outline: "none", fontFamily: "Montserrat, sans-serif", width: "100%", boxSizing: "border-box" }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selStyle}>
            <option value="all">Todos los estados</option>
            <option value="confirmed">Solo pagados</option>
            <option value="pending">Solo pendientes</option>
          </select>
          <select value={periodoFilter} onChange={(e) => setPeriodoFilter(e.target.value)} style={selStyle}>
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Últimos 30 días</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...selStyle, minWidth: 180 }}>
            <option value="newest">Más recientes primero</option>
            <option value="oldest">Más antiguos primero</option>
            <option value="amount_desc">Mayor monto primero</option>
            <option value="amount_asc">Menor monto primero</option>
          </select>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px 56px" }}>

        {/* ── Stat cards ── */}
        <div style={{ display: "flex", gap: 14, margin: "26px 0 22px", flexWrap: "wrap" }}>
          {[
            { icon: "fa-circle-check", label: "Confirmadas",    value: confirmedFiltered.length,                         color: "#C68A95", glow: "rgba(198,138,149,0.18)" },
            { icon: "fa-sack-dollar",  label: "Total recaudado", value: fmtPrecio(totalFiltrado),                         color: "#C68A95", glow: "rgba(198,138,149,0.18)" },
            { icon: "fa-clock",        label: "Pendientes",     value: filtered.filter(o => o.status === "pending").length, color: "#d4920a", glow: "rgba(212,146,10,0.15)" },
            { icon: "fa-filter",       label: "Mostrando",      value: filtered.length,                                  color: "#8B6F6F", glow: "rgba(139,111,111,0.15)" },
          ].map((card) => (
            <div key={card.label} style={{
              flex: 1, minWidth: 140,
              background: cardBg,
              borderRadius: 18,
              padding: "22px 20px",
              textAlign: "center",
              boxShadow: `0 4px 24px ${card.glow}, 0 1px 0 rgba(255,255,255,0.5)`,
              border: `1.5px solid ${cardBorder}`,
              backdropFilter: "blur(12px)",
              position: "relative", overflow: "hidden",
            }}>
              {/* acento superior del card */}
              <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: 2, background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`, borderRadius: "0 0 4px 4px" }} />
              <i className={`fa-solid ${card.icon}`} style={{ fontSize: 22, color: card.color, marginBottom: 8, display: "block", filter: `drop-shadow(0 2px 6px ${card.glow})` }} />
              <p style={{ margin: "0 0 5px", fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: "0.14em", ...MONO }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: card.color, ...MONO }}>{card.value}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 0", color: textMuted }}>
            <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 40, marginBottom: 14, display: "block", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 15 }}>No se encontraron órdenes con ese criterio.</p>
          </div>
        )}

        {/* ── Lista de órdenes ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((order) => {
            const isConfirmed = order.status === "confirmed";
            const isOpen = expanded.has(order.buy_order);
            const direccion = [order.customer_dir, order.customer_depto, order.customer_ciudad, order.customer_region].filter(Boolean).join(", ");
            const itemTotal = order.amount || order.total;

            return (
              <div key={order.buy_order} style={{
                background: cardBg,
                borderRadius: 16,
                boxShadow: isOpen
                  ? "0 8px 32px rgba(0,0,0,0.14)"
                  : "0 2px 12px rgba(0,0,0,0.07)",
                border: `1.5px solid ${isConfirmed ? cardBorder : "rgba(212,146,10,0.35)"}`,
                overflow: "hidden",
                transition: "box-shadow 0.2s",
                backdropFilter: "blur(8px)",
                position: "relative",
              }}>
                {/* Franja lateral de color */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                  background: isConfirmed
                    ? "linear-gradient(180deg, #C68A95, #D8A7B1)"
                    : "linear-gradient(180deg, #f0b429, #e0a800)",
                  borderRadius: "4px 0 0 4px",
                }} />

                {/* Fila compacta */}
                <button
                  onClick={() => setExpanded(prev => {
                    const next = new Set(prev);
                    isOpen ? next.delete(order.buy_order) : next.add(order.buy_order);
                    return next;
                  })}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "15px 20px 15px 22px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", textAlign: "left", fontFamily: "Georgia, serif" }}
                >
                  <i className={`fa-solid ${isConfirmed ? "fa-circle-check" : "fa-clock"}`}
                    style={{ color: isConfirmed ? "#4caf50" : "#e0a800", fontSize: 16, flexShrink: 0 }} />

                  <span style={{ fontWeight: 600, color: "#C68A95", fontSize: 13, minWidth: 190, ...MONO, letterSpacing: "0.01em" }}>
                    {order.buy_order}
                  </span>

                  <span style={{
                    padding: "3px 11px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: isConfirmed ? (dark ? "rgba(76,175,80,0.2)" : "#e8f5e9") : (dark ? "rgba(224,168,0,0.18)" : "#fff8e1"),
                    color: isConfirmed ? "#4caf50" : "#c8900a",
                    textTransform: "uppercase", letterSpacing: "0.08em", ...MONO,
                    border: `1px solid ${isConfirmed ? "rgba(76,175,80,0.3)" : "rgba(200,144,10,0.3)"}`,
                  }}>
                    {isConfirmed ? "Pagado" : "Pendiente"}
                  </span>

                  <span style={{ color: textMuted, fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.customer_nombre || "—"}
                  </span>

                  <span style={{ fontWeight: 700, color: "#C68A95", fontSize: 17, marginLeft: "auto", ...MONO }}>
                    {fmtPrecio(itemTotal)}
                  </span>

                  <span style={{ color: textMuted, fontSize: 11, minWidth: 120, textAlign: "right", ...MONO }}>
                    {fmtFecha(order.created_at)}
                  </span>

                  <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"}`}
                    style={{ color: textMuted, fontSize: 11, flexShrink: 0, transition: "transform 0.2s" }} />
                </button>

                {/* Detalle expandible */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${cardBorder}`, display: "flex", flexWrap: "wrap" }}>

                    {/* Cliente */}
                    <div style={{ flex: "0 0 270px", padding: "22px 24px", borderRight: `1px solid ${cardBorder}` }}>
                      <p style={{ margin: "0 0 14px", fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: "0.16em", ...MONO }}>
                        <i className="fa-solid fa-user" style={{ marginRight: 6, color: "#C68A95" }} />Cliente
                      </p>
                      <p style={{ margin: "0 0 10px", fontSize: 16, fontWeight: "bold", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {order.customer_nombre || "—"}
                      </p>
                      <p style={{ margin: "0 0 5px", fontSize: 12, color: textMuted }}>
                        <i className="fa-regular fa-envelope" style={{ marginRight: 6, width: 14, color: "#C68A95", opacity: 0.7 }} />{order.customer_email}
                      </p>
                      <p style={{ margin: "0 0 5px", fontSize: 12, color: textMuted, ...MONO }}>
                        <i className="fa-solid fa-phone" style={{ marginRight: 6, width: 14, color: "#C68A95", opacity: 0.7 }} />{order.customer_tel}
                      </p>
                      {direccion && (
                        <p style={{ margin: "10px 0 0", fontSize: 12, color: textMuted, lineHeight: 1.6 }}>
                          <i className="fa-solid fa-location-dot" style={{ marginRight: 6, color: "#C68A95", opacity: 0.7 }} />{direccion}
                        </p>
                      )}
                      {order.zona && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, padding: "4px 12px", background: dark ? "rgba(198,138,149,0.12)" : "rgba(198,138,149,0.08)", border: "1px solid rgba(198,138,149,0.25)", borderRadius: 20, fontSize: 11, color: "#C68A95" }}>
                          <i className="fa-solid fa-truck" />
                          {order.zona === "santiago" ? "Santiago (RM)" : "Regiones"}
                        </span>
                      )}
                    </div>

                    {/* Productos */}
                    <div style={{ flex: 1, minWidth: 240, padding: "22px 24px" }}>
                      <p style={{ margin: "0 0 14px", fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: "0.16em", ...MONO }}>
                        <i className="fa-solid fa-bag-shopping" style={{ marginRight: 6, color: "#C68A95" }} />Productos
                      </p>
                      {order.items && order.items.length > 0 ? (
                        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", ...MONO }}>
                          <tbody>
                            {order.items.map((item, i) => (
                              <tr key={i} style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                <td style={{ padding: "7px 0", color: textMain, fontFamily: "Georgia, serif", fontVariantNumeric: "normal" }}>
                                  {item.nombre} <span style={{ color: textMuted, ...MONO }}>×{item.qty}</span>
                                </td>
                                <td style={{ padding: "7px 0", textAlign: "right", color: textMuted }}>{fmtPrecio(item.precio * item.qty)}</td>
                              </tr>
                            ))}
                            <tr style={{ borderTop: `1.5px solid ${cardBorder}` }}>
                              <td style={{ padding: "7px 0", color: textMuted, fontSize: 12, fontFamily: "Georgia, serif" }}>Envío</td>
                              <td style={{ padding: "7px 0", textAlign: "right", color: textMuted, fontSize: 12 }}>{order.envio === 0 ? "Gratis" : fmtPrecio(order.envio)}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: "8px 0", fontWeight: 600, color: textMain, fontFamily: "Georgia, serif" }}>Total</td>
                              <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700, fontSize: 22, color: "#C68A95" }}>{fmtPrecio(itemTotal)}</td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ color: textMuted, fontStyle: "italic", fontSize: 13 }}>Sin detalle de productos</p>
                      )}
                      {order.auth_code && (
                        <p style={{ margin: "14px 0 0", fontSize: 11, color: textMuted, ...MONO, padding: "8px 12px", background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 8 }}>
                          <i className="fa-solid fa-credit-card" style={{ marginRight: 6, color: "#C68A95", opacity: 0.7 }} />
                          **** {order.card_last4} &nbsp;·&nbsp; Auth: {order.auth_code}
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
