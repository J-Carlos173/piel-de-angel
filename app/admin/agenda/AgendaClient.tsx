"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";
import type { Cita } from "@/app/api/admin/agenda/route";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fmtFecha(fechaStr: string) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} ${MESES[m - 1]} ${y}`;
}

export default function AgendaClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"proximas" | "pasadas">("proximas");

  const bg        = dark ? "#160f13" : "#f5eeec";
  const cardBg    = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border    = dark ? "#3a2830" : "#ecddd9";
  const textMain  = dark ? "#f0dde6" : "#2e1e24";
  const textMuted = dark ? "#9a7c86" : "#9a8486";
  const inputBg   = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  useEffect(() => {
    fetch("/api/admin/agenda")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setCitas(data.citas ?? []);
        setLoading(false);
      })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  const proximas = citas.filter((c) => !c.pasada).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  const pasadas  = citas.filter((c) => c.pasada).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
  const visible  = tab === "proximas" ? proximas : pasadas;

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

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
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(91,126,100,0.20)" : "rgba(91,126,100,0.10)", border: `1px solid ${dark ? "#3a5540" : "#c5dcc6"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#a8d4a8" : "#4A6B52", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "rgba(127,168,130,0.65)" : "#7A9E8A", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Gestión de Citas</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#d4e8d6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Agenda</h1>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(91,126,100,0.20)" : "rgba(91,126,100,0.10)", border: `1.5px solid ${dark ? "#3a5540" : "#c5dcc6"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#a8d4a8" : "#4A6B52", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["proximas", "pasadas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: "9px 20px", borderRadius: 12, fontSize: 13, cursor: "pointer", ...MONO, border: `1.5px solid ${tab === t ? "#C68A95" : border}`, background: tab === t ? "rgba(198,138,149,0.12)" : inputBg, color: tab === t ? "#C68A95" : textMuted, fontWeight: tab === t ? 700 : 400 }}
            >
              {t === "proximas"
                ? <><i className="fa-solid fa-calendar-check" style={{ marginRight: 7 }} />Próximas ({proximas.length})</>
                : <><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 7 }} />Historial ({pasadas.length})</>
              }
            </button>
          ))}
        </div>

        {/* Contenido */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted, ...MONO }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: "block" }} />
            Cargando agenda...
          </div>
        ) : error ? (
          <div style={{ background: cardBg, border: `1.5px solid #e57373`, borderRadius: 16, padding: "24px", color: "#e57373", ...MONO, fontSize: 13 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
            Error al cargar la agenda: {error}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted }}>
            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 36, display: "block", marginBottom: 14, opacity: 0.4 }} />
            <p style={{ ...MONO, fontSize: 13 }}>
              {tab === "proximas" ? "No hay citas próximas" : "No hay citas en el historial"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((c) => (
              <div key={c.id} style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 16, padding: "20px 24px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

                {/* Fecha/hora */}
                <div style={{ minWidth: 110, flexShrink: 0, textAlign: "center", background: `linear-gradient(145deg, rgba(198,138,149,0.12), rgba(198,138,149,0.06))`, border: `1px solid rgba(198,138,149,0.25)`, borderRadius: 12, padding: "12px 8px" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#C68A95", ...MONO }}>{c.hora}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 10, color: textMuted, ...MONO, lineHeight: 1.4 }}>{fmtFecha(c.fecha)}</p>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 17, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{c.nombre || "Sin nombre"}</p>
                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#C68A95", ...MONO, fontWeight: 600 }}>
                    <i className="fa-solid fa-scissors" style={{ marginRight: 5, opacity: 0.7 }} />
                    {c.servicio || "Servicio no especificado"}
                  </p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: textMuted, ...MONO, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                        <i className="fa-solid fa-envelope" style={{ fontSize: 11 }} />{c.email}
                      </a>
                    )}
                    {c.telefono && (
                      <a href={`tel:${c.telefono}`} style={{ fontSize: 12, color: textMuted, ...MONO, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                        <i className="fa-solid fa-phone" style={{ fontSize: 11 }} />{c.telefono}
                      </a>
                    )}
                  </div>
                </div>

                {/* Badge */}
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontSize: 10, ...MONO, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 20, background: c.pasada ? `rgba(154,124,134,0.1)` : `rgba(129,199,132,0.12)`, color: c.pasada ? textMuted : "#66bb6a", border: `1px solid ${c.pasada ? border : "rgba(102,187,106,0.3)"}` }}>
                    {c.pasada ? "Realizada" : "Próxima"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
