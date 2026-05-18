"use client";

import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const ROSA_PALETTE = ["#C68A95", "#8B6F6F", "#D8A7B1", "#7A5560", "#E8C4CC", "#5C3D47"];

function fmtPrecio(n: number) {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type ChartEntry = { name: string; value: number };

function DonutCard({
  title, subtitle, data, total,
  cardBg, border, textMain, textMuted,
}: {
  title: string; subtitle: string; data: ChartEntry[]; total: number;
  cardBg: string; border: string; textMain: string; textMuted: string;
}) {
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif", fontVariantNumeric: "tabular-nums" };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#C68A95", fontSize: 13 }}>{payload[0].name}</p>
        <p style={{ margin: "4px 0 0", color: textMain, fontSize: 14, ...MONO }}>{fmtPrecio(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div style={{ background: cardBg, borderRadius: 20, padding: "28px 28px", border: `1.5px solid ${border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: "normal", color: textMain }}>{title}</h3>
      <p style={{ margin: "0 0 24px", fontSize: 12, color: textMuted, ...MONO }}>{subtitle}</p>

      {/* Círculo izquierda — leyenda derecha */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>

        {/* Dona */}
        <div style={{ flex: "0 0 200px" }}>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={95} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                {data.map((_, i) => <Cell key={i} fill={ROSA_PALETTE[i % ROSA_PALETTE.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda personalizada */}
        <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
          {data.map((entry, i) => {
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            return (
              <div key={entry.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: ROSA_PALETTE[i % ROSA_PALETTE.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: textMain }}>{entry.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: textMuted, ...MONO }}>{fmtPrecio(entry.value)}</span>
                    <span style={{ fontSize: 11, color: "#C68A95", fontWeight: 700, ...MONO, minWidth: 34, textAlign: "right" }}>{pct}%</span>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div style={{ height: 4, background: "rgba(198,138,149,0.12)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: ROSA_PALETTE[i % ROSA_PALETTE.length], borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function VentasClient({
  zonaData, productData, monthData, totalOrders,
}: {
  zonaData: ChartEntry[];
  productData: ChartEntry[];
  monthData: ChartEntry[];
  totalOrders: number;
}) {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const gridColor= dark ? "#3a2830" : "#f0e0dc";

  const totalRevenue = zonaData.reduce((s, d) => s + d.value, 0);
  const totalProducts = productData.reduce((s, d) => s + d.value, 0);

  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif", fontVariantNumeric: "tabular-nums" };

  const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: textMuted, ...MONO }}>{label}</p>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#C68A95", ...MONO }}>{fmtPrecio(payload[0].value)}</p>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Georgia, serif", transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1a2620 0%, #1e2e24 55%, #16231a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #f6fbf7 60%, #eef7ef 100%)",
        padding: "32px 32px 28px", position: "relative", overflow: "hidden",
        borderBottom: dark ? "1.5px solid #3a5540" : "1.5px solid #c5dcc6",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #7FA882, #5B7E64, #7FA882, transparent)" }} />
        <svg aria-hidden style={{ position: "absolute", right: 0, top: -8, opacity: dark ? 0.07 : 0.08, width: 150, pointerEvents: "none" }} viewBox="0 0 220 320">
          <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#4A6B52"/>
          <path d="M110,10 C105,80 108,175 108,268" stroke="#2E4D35" strokeWidth="2" fill="none" opacity={0.4}/>
        </svg>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(91,126,100,0.20)" : "rgba(91,126,100,0.10)", border: `1px solid ${dark ? "#3a5540" : "#c5dcc6"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#a8d4a8" : "#4A6B52", fontSize: 12, cursor: "pointer", marginBottom: 10, fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "rgba(127,168,130,0.65)" : "#7A9E8A", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Reportes · Piel de Ángel</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#d4e8d6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Reportes</h1>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(91,126,100,0.20)" : "rgba(91,126,100,0.10)", border: `1.5px solid ${dark ? "#3a5540" : "#c5dcc6"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#a8d4a8" : "#4A6B52", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 56px" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { label: "Órdenes confirmadas", value: String(totalOrders), icon: "fa-circle-check" },
            { label: "Ingresos totales", value: fmtPrecio(totalRevenue), icon: "fa-sack-dollar" },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, minWidth: 180, background: cardBg, borderRadius: 18, padding: "20px 24px", border: `1.5px solid ${border}`, boxShadow: "0 4px 20px rgba(198,138,149,0.12)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: "linear-gradient(90deg, transparent, #C68A95, transparent)" }} />
              <i className={`fa-solid ${s.icon}`} style={{ color: "#C68A95", fontSize: 20, marginBottom: 8, display: "block" }} />
              <p style={{ margin: "0 0 4px", fontSize: 11, color: textMuted, textTransform: "uppercase", letterSpacing: "0.12em", ...MONO }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#C68A95", ...MONO }}>{s.value}</p>
            </div>
          ))}
        </div>

        {totalOrders === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: textMuted }}>
            <i className="fa-solid fa-chart-pie" style={{ fontSize: 48, opacity: 0.3, display: "block", marginBottom: 16 }} />
            <p>Aún no hay ventas confirmadas para mostrar.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <DonutCard title="Por zona de despacho" subtitle="Ingresos según destino"
              data={zonaData} total={totalRevenue}
              cardBg={cardBg} border={border} textMain={textMain} textMuted={textMuted} />

            <DonutCard title="Top productos" subtitle="Ingresos por producto (top 6)"
              data={productData} total={totalProducts}
              cardBg={cardBg} border={border} textMain={textMain} textMuted={textMuted} />

            {monthData.length > 0 && (
              <div style={{ background: cardBg, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: "normal", color: textMain }}>Ingresos por mes</h3>
                <p style={{ margin: "0 0 24px", fontSize: 12, color: textMuted, ...MONO }}>Meses con actividad</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthData} margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: textMuted, fontSize: 12, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"} tick={{ fill: textMuted, fontSize: 11, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(198,138,149,0.08)" }} />
                    <Bar dataKey="value" fill="#C68A95" radius={[8, 8, 0, 0]} name="Ingresos" maxBarSize={80} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
