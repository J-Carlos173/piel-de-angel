"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import type { Cita } from "@/app/api/admin/agenda/route";
import AdminHeader from "../AdminHeader";

const DIAS  = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function fmtFecha(fechaStr: string) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS[date.getDay()]} ${d} ${MESES[m - 1]} ${y}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

type SlotStatus = { time: string; blocked: boolean; reason: string };
type Tab = "proximas" | "pasadas" | "bloquear";

export default function AgendaClient() {
  const { dark } = useThemeStore();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [tab, setTab]       = useState<Tab>("proximas");

  // Bloqueo de horas
  const [bloqueoFecha, setBloqueoFecha]     = useState(todayStr);
  const [slots, setSlots]                   = useState<SlotStatus[]>([]);
  const [loadingSlots, setLoadingSlots]     = useState(false);
  const [toggling, setToggling]             = useState<string | null>(null);

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

  // Cargar slots cada vez que cambia la fecha o se activa la pestaña
  useEffect(() => {
    if (tab !== "bloquear") return;
    setLoadingSlots(true);
    fetch(`/api/admin/blocked-slots?date=${bloqueoFecha}`)
      .then((r) => r.json())
      .then((data) => { setSlots(data.slots ?? []); setLoadingSlots(false); })
      .catch(() => setLoadingSlots(false));
  }, [bloqueoFecha, tab]);

  async function toggleBloqueo(slot: SlotStatus) {
    setToggling(slot.time);
    if (slot.blocked) {
      await fetch("/api/admin/blocked-slots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: bloqueoFecha, time: slot.time }),
      });
      setSlots((prev) => prev.map((s) => s.time === slot.time ? { ...s, blocked: false, reason: "" } : s));
    } else {
      await fetch("/api/admin/blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: bloqueoFecha, time: slot.time }),
      });
      setSlots((prev) => prev.map((s) => s.time === slot.time ? { ...s, blocked: true } : s));
    }
    setToggling(null);
  }

  const proximas = citas.filter((c) => !c.pasada).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
  const pasadas  = citas.filter((c) => c.pasada).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
  const visible  = tab === "proximas" ? proximas : pasadas;

  const inputStyle: React.CSSProperties = {
    background: inputBg, border: `1px solid ${border}`, borderRadius: 10,
    padding: "9px 12px", color: textMain, fontSize: 13,
    fontFamily: "Montserrat, sans-serif", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", transition: "background 0.3s" }}>

      <AdminHeader eyebrow="Gestión de Citas" title="Agenda" backHref="/admin" />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {([
            { key: "proximas", icon: "fa-calendar-check", label: `Próximas (${proximas.length})` },
            { key: "pasadas",  icon: "fa-clock-rotate-left", label: `Historial (${pasadas.length})` },
            { key: "bloquear", icon: "fa-lock", label: "Bloquear horas" },
          ] as { key: Tab; icon: string; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "9px 20px", borderRadius: 12, fontSize: 13, cursor: "pointer", ...MONO,
                border: `1.5px solid ${tab === t.key ? "#C68A95" : border}`,
                background: tab === t.key ? "rgba(198,138,149,0.12)" : inputBg,
                color: tab === t.key ? "#C68A95" : textMuted,
                fontWeight: tab === t.key ? 700 : 400,
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <i className={`fa-solid ${t.icon}`} style={{ fontSize: 12 }} />{t.label}
            </button>
          ))}
        </div>

        {/* ── PESTAÑA BLOQUEAR ── */}
        {tab === "bloquear" && (
          <div>
            {/* Selector de fecha */}
            <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 20, padding: "24px 28px", marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: textMuted, ...MONO }}>
                Selecciona un día para ver sus horarios disponibles y bloquear los que necesites.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <input
                  type="date"
                  value={bloqueoFecha}
                  min={todayStr()}
                  onChange={(e) => setBloqueoFecha(e.target.value)}
                  style={{ ...inputStyle, minWidth: 180 }}
                />
                <span style={{ fontSize: 14, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {fmtFecha(bloqueoFecha)}
                </span>
              </div>
            </div>

            {/* Slots del día */}
            <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 20, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              {loadingSlots ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: textMuted, ...MONO }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22, display: "block", marginBottom: 10 }} />
                  Cargando horarios...
                </div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: textMuted }}>
                  <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 30, display: "block", marginBottom: 12, opacity: 0.4 }} />
                  <p style={{ ...MONO, fontSize: 13 }}>Este día no tiene horarios disponibles.</p>
                  <p style={{ ...MONO, fontSize: 11, marginTop: 4 }}>Se atiende de lunes a viernes de 16:30 a 20:00, y sábado de 9:00 a 20:00.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: textMuted, ...MONO }}>
                    {slots.filter((s) => s.blocked).length === 0
                      ? "Todos los horarios están disponibles."
                      : `${slots.filter((s) => s.blocked).length} de ${slots.length} horarios bloqueados.`}
                  </p>
                  {slots.map((slot) => (
                    <div
                      key={slot.time}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 18px", borderRadius: 14,
                        border: `1.5px solid ${slot.blocked ? "rgba(229,115,115,0.35)" : border}`,
                        background: slot.blocked
                          ? dark ? "rgba(229,115,115,0.08)" : "rgba(229,115,115,0.05)"
                          : dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <i
                          className={`fa-solid ${slot.blocked ? "fa-lock" : "fa-lock-open"}`}
                          style={{ color: slot.blocked ? "#e57373" : "#81c784", fontSize: 16, width: 18, textAlign: "center" }}
                        />
                        <div>
                          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: slot.blocked ? "#e57373" : textMain, ...MONO }}>
                            {slot.time}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: textMuted, ...MONO }}>
                            {slot.blocked ? "Bloqueado · no visible para clientas" : "Disponible para reservas"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleBloqueo(slot)}
                        disabled={toggling === slot.time}
                        style={{
                          border: `1.5px solid ${slot.blocked ? "#e57373" : "#81c784"}`,
                          borderRadius: 10, padding: "8px 18px",
                          background: slot.blocked
                            ? dark ? "rgba(229,115,115,0.15)" : "rgba(229,115,115,0.08)"
                            : dark ? "rgba(129,199,132,0.15)" : "rgba(129,199,132,0.08)",
                          color: slot.blocked ? "#e57373" : "#66bb6a",
                          fontSize: 12, cursor: toggling === slot.time ? "wait" : "pointer",
                          ...MONO, display: "flex", alignItems: "center", gap: 7,
                          fontWeight: 600,
                        }}
                      >
                        {toggling === slot.time
                          ? <i className="fa-solid fa-spinner fa-spin" />
                          : slot.blocked
                            ? <><i className="fa-solid fa-lock-open" /> Desbloquear</>
                            : <><i className="fa-solid fa-lock" /> Bloquear</>
                        }
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PESTAÑAS CITAS ── */}
        {tab !== "bloquear" && (
          <>
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

                    <div style={{ minWidth: 110, flexShrink: 0, textAlign: "center", background: `linear-gradient(145deg, rgba(198,138,149,0.12), rgba(198,138,149,0.06))`, border: `1px solid rgba(198,138,149,0.25)`, borderRadius: 12, padding: "12px 8px" }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#C68A95", ...MONO }}>{c.hora}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 10, color: textMuted, ...MONO, lineHeight: 1.4 }}>{fmtFecha(c.fecha)}</p>
                    </div>

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

                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: 10, ...MONO, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 20, background: c.pasada ? `rgba(154,124,134,0.1)` : `rgba(129,199,132,0.12)`, color: c.pasada ? textMuted : "#66bb6a", border: `1px solid ${c.pasada ? border : "rgba(102,187,106,0.3)"}` }}>
                        {c.pasada ? "Realizada" : "Próxima"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
