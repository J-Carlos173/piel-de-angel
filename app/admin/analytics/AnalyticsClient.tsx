"use client";

import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const PAGE_LABELS: Record<string, string> = {
  "/": "Inicio",
  "/#productos": "Tienda",
  "/#servicios": "Servicios",
  "/#agenda": "Agenda",
  "/#nosotros": "Nosotros",
  "/#promociones": "Promos",
};

function label(path: string) {
  return PAGE_LABELS[path] ?? path;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
}

export default function AnalyticsClient({
  daily, topPages, today, week, month, total,
}: {
  daily: { date: string; views: number }[];
  topPages: { path: string; views: number }[];
  today: number; week: number; month: number; total: number;
}) {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const gridColor= dark ? "#3a2830" : "#f0e0dc";

  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif", fontVariantNumeric: "tabular-nums" };

  const chartData = daily.map((d) => ({ name: fmtDate(d.date), Visitas: d.views }));

  const CustomTooltip = ({ active, payload, label: lbl }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 10, padding: "10px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: textMuted, ...MONO }}>{lbl}</p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#C68A95", ...MONO }}>{payload[0].value} visitas</p>
      </div>
    );
  };

  const maxViews = Math.max(...topPages.map((p) => p.views), 1);

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Georgia, serif", transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(145deg, #5C3D47 0%, #8B5E6A 30%, #C68A95 68%, #E2B4BC 100%)", padding: "32px 32px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }} />

        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "5px 12px", color: "#fff", fontSize: 12, cursor: "pointer", marginBottom: 10, fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Analytics · Piel de Ángel</p>
            <h1 style={{ margin: "6px 0 2px", color: "#fff", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Visitas al sitio</h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Solo páginas del sitio público · sin admin</p>
          </div>
          <button onClick={toggle} style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.32)", borderRadius: 12, padding: "9px 13px", color: "#fff", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 56px" }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Hoy",       value: today,  icon: "fa-eye"         },
            { label: "7 días",    value: week,   icon: "fa-calendar-week" },
            { label: "Este mes",  value: month,  icon: "fa-calendar"    },
            { label: "Total",     value: total,  icon: "fa-chart-line"  },
          ].map((s) => (
            <div key={s.label} style={{ background: cardBg, borderRadius: 18, padding: "22px 20px", border: `1.5px solid ${border}`, boxShadow: "0 4px 20px rgba(198,138,149,0.10)", position: "relative", overflow: "hidden", textAlign: "center" }}>
              <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, background: "linear-gradient(90deg, transparent, #C68A95, transparent)" }} />
              <i className={`fa-solid ${s.icon}`} style={{ color: "#C68A95", fontSize: 20, marginBottom: 8, display: "block" }} />
              <p style={{ margin: "0 0 4px", fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: "0.14em", ...MONO }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#C68A95", ...MONO }}>{s.value ?? 0}</p>
            </div>
          ))}
        </div>

        {total === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: textMuted }}>
            <i className="fa-solid fa-chart-line" style={{ fontSize: 48, opacity: 0.3, display: "block", marginBottom: 16 }} />
            <p style={{ margin: 0, fontSize: 15 }}>Aún no hay visitas registradas.</p>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: textMuted }}>Las visitas se empezarán a registrar desde ahora.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Gráfico de área */}
            {chartData.length > 0 && (
              <div style={{ background: cardBg, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: "normal", color: textMain }}>Visitas diarias</h3>
                <p style={{ margin: "0 0 24px", fontSize: 12, color: textMuted, ...MONO }}>Últimos 30 días</p>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rosaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#C68A95" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#C68A95" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: textMuted, fontSize: 11, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: textMuted, fontSize: 11, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#C68A95", strokeWidth: 1, strokeDasharray: "4 4" }} />
                    <Area type="monotone" dataKey="Visitas" stroke="#C68A95" strokeWidth={2.5} fill="url(#rosaGrad)" dot={{ fill: "#C68A95", r: 3 }} activeDot={{ r: 5, fill: "#8B6F6F" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top páginas */}
            {topPages.length > 0 && (
              <div style={{ background: cardBg, borderRadius: 20, padding: "28px 24px", border: `1.5px solid ${border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: "normal", color: textMain }}>Páginas más visitadas</h3>
                <p style={{ margin: "0 0 24px", fontSize: 12, color: textMuted, ...MONO }}>Total histórico</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {topPages.map((p) => (
                    <div key={p.path}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: textMain }}>{label(p.path)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#C68A95", ...MONO }}>{p.views}</span>
                      </div>
                      <div style={{ height: 6, background: dark ? "#3a2830" : "#f0e0dc", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.round((p.views / maxViews) * 100)}%`, background: "linear-gradient(90deg, #8B6F6F, #C68A95)", borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
