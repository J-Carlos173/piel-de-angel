"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import AdminHeader from "../AdminHeader";

type Tarea = {
  id: number;
  tipo: "tarea" | "nota";
  titulo: string;
  detalle: string | null;
  responsable: string | null;
  vence: string | null;
  hecha: boolean;
};

type Paleta = { dark: boolean; cardBg: string; border: string; textMain: string; textMuted: string; inputBg: string };

const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };
const RESPONSABLES = ["Tere", "Carlos", "Claude"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function hoyStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diasHasta(vence: string): number {
  const [y, m, d] = vence.split("-").map(Number);
  const [hy, hm, hd] = hoyStr().split("-").map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(hy, hm - 1, hd)) / 86400000);
}

function etiquetaVence(vence: string): { texto: string; color: string } {
  const dias = diasHasta(vence);
  const [, m, d] = vence.split("-").map(Number);
  const fecha = `${d} ${MESES[m - 1]}`;
  if (dias < 0) return { texto: `Vencida · ${fecha}`, color: "#C0392B" };
  if (dias === 0) return { texto: "Vence hoy", color: "#D9822B" };
  if (dias <= 3) return { texto: `En ${dias} día${dias > 1 ? "s" : ""} · ${fecha}`, color: "#D9822B" };
  return { texto: fecha, color: "#9a8486" };
}

async function llamar(method: string, body?: unknown) {
  const res = await fetch("/api/admin/tareas", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

function TareaCard({
  t, c, abierta, onAbrir, onToggle, onBorrar, onCambiar,
}: {
  t: Tarea; c: Paleta; abierta: boolean;
  onAbrir: () => void; onToggle: () => void; onBorrar: () => void;
  onCambiar: (campos: Partial<Pick<Tarea, "vence" | "responsable">>) => void;
}) {
  const esNota = t.tipo === "nota";
  const venc = !esNota && !t.hecha && t.vence ? etiquetaVence(t.vence) : null;

  return (
    <div style={{ background: c.cardBg, border: `1.5px solid ${venc?.color === "#C0392B" ? "#C0392B55" : c.border}`, borderRadius: 16, padding: "16px 18px", opacity: t.hecha ? 0.65 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {!esNota && (
          <button
            onClick={onToggle}
            aria-label={t.hecha ? "Marcar como pendiente" : "Marcar como hecha"}
            style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 1, cursor: "pointer",
              border: `2px solid ${t.hecha ? "#C68A95" : c.border}`,
              background: t.hecha ? "#C68A95" : "transparent", color: "#fff", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {t.hecha && <i className="fa-solid fa-check" />}
          </button>
        )}
        {esNota && <i className="fa-regular fa-lightbulb" style={{ color: "#C68A95", fontSize: 18, marginTop: 3 }} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <button
            onClick={onAbrir}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%", color: c.textMain, fontSize: 16, fontFamily: "'Cormorant Garamond', Georgia, serif", textDecoration: t.hecha ? "line-through" : "none" }}
          >
            {t.titulo}
          </button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {t.responsable && (
              <span style={{ ...MONO, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(198,138,149,0.14)", color: "#C68A95" }}>{t.responsable}</span>
            )}
            {venc && (
              <span style={{ ...MONO, fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${venc.color}18`, color: venc.color, fontWeight: 600 }}>
                <i className="fa-regular fa-clock" style={{ marginRight: 5 }} />{venc.texto}
              </span>
            )}
          </div>
          {(abierta || esNota) && t.detalle && (
            <p style={{ ...MONO, margin: "12px 0 0", fontSize: 13, lineHeight: 1.7, color: c.textMuted }}>{t.detalle}</p>
          )}
          {abierta && !esNota && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
              <label style={{ ...MONO, fontSize: 11, color: c.textMuted }}>
                Fecha límite<br />
                <input type="date" value={t.vence ?? ""} onChange={(e) => onCambiar({ vence: e.target.value || null })}
                  style={{ ...MONO, marginTop: 4, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.inputBg, color: c.textMain, fontSize: 13 }} />
              </label>
              <label style={{ ...MONO, fontSize: 11, color: c.textMuted }}>
                Responsable<br />
                <select value={t.responsable ?? ""} onChange={(e) => onCambiar({ responsable: e.target.value || null })}
                  style={{ ...MONO, marginTop: 4, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.inputBg, color: c.textMain, fontSize: 13 }}>
                  <option value="">Sin asignar</option>
                  {RESPONSABLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>

        <button onClick={onBorrar} aria-label="Eliminar" title="Eliminar"
          style={{ background: "none", border: "none", cursor: "pointer", color: c.textMuted, opacity: 0.5, fontSize: 14, padding: 4 }}>
          <i className="fa-regular fa-trash-can" />
        </button>
      </div>
    </div>
  );
}

export default function TareasClient() {
  const { dark } = useThemeStore();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [creando, setCreando] = useState(false);
  const [verHechas, setVerHechas] = useState(false);
  const [abiertas, setAbiertas] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({ tipo: "tarea", titulo: "", detalle: "", responsable: "", vence: "" });
  const [guardando, setGuardando] = useState(false);

  const c: Paleta = {
    dark,
    cardBg: dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)",
    border: dark ? "#3a2830" : "#ecddd9",
    textMain: dark ? "#f0dde6" : "#2e1e24",
    textMuted: dark ? "#9a7c86" : "#9a8486",
    inputBg: dark ? "rgba(255,255,255,0.06)" : "#fdf8f7",
  };

  useEffect(() => {
    llamar("GET")
      .then((d) => { setTareas(d.tareas ?? []); if (d.error) setError(d.error); })
      .catch(() => setError("No se pudieron cargar las tareas."))
      .finally(() => setCargando(false));
  }, []);

  function reemplazar(t: Tarea) {
    setTareas((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  }

  async function toggle(t: Tarea) {
    const d = await llamar("PATCH", { id: t.id, hecha: !t.hecha });
    if (d.tarea) reemplazar(d.tarea);
  }

  async function cambiar(t: Tarea, campos: Partial<Pick<Tarea, "vence" | "responsable">>) {
    const d = await llamar("PATCH", { id: t.id, ...campos });
    if (d.tarea) reemplazar(d.tarea);
  }

  async function borrar(t: Tarea) {
    if (!confirm(`¿Eliminar "${t.titulo}"?`)) return;
    await llamar("DELETE", { id: t.id });
    setTareas((prev) => prev.filter((x) => x.id !== t.id));
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setGuardando(true);
    const d = await llamar("POST", form);
    setGuardando(false);
    if (d.tarea) {
      setTareas((prev) => [...prev, d.tarea]);
      setForm({ tipo: form.tipo, titulo: "", detalle: "", responsable: "", vence: "" });
      setCreando(false);
    } else {
      setError(d.error || "No se pudo guardar.");
    }
  }

  function alternar(id: number) {
    setAbiertas((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  const pendientes = tareas.filter((t) => t.tipo === "tarea" && !t.hecha);
  const hechas = tareas.filter((t) => t.tipo === "tarea" && t.hecha);
  const notas = tareas.filter((t) => t.tipo === "nota");
  const vencidas = pendientes.filter((t) => t.vence && diasHasta(t.vence) < 0).length;

  const inputStyle: React.CSSProperties = {
    ...MONO, width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 12,
    border: `1.5px solid ${c.border}`, background: c.inputBg, color: c.textMain, fontSize: 14, outline: "none",
  };
  const labelStyle: React.CSSProperties = { ...MONO, display: "block", fontSize: 11, color: c.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" };
  const tituloSeccion = (txt: string, n?: number): React.ReactNode => (
    <h2 style={{ margin: "34px 0 14px", fontSize: 20, fontWeight: "normal", color: c.textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      {txt}{n !== undefined && <span style={{ ...MONO, fontSize: 12, color: c.textMuted, marginLeft: 8 }}>{n}</span>}
    </h2>
  );

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <AdminHeader
        eyebrow="Pendientes y notas"
        title="Tareas y notas"
        subtitle="Lo que falta para llegar a más gente, y cosas para recordar"
        backHref="/admin"
        maxWidth={860}
        rightExtra={
          <button
            onClick={() => setCreando((v) => !v)}
            style={{ background: creando ? "rgba(198,138,149,0.22)" : "rgba(198,138,149,0.10)", border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`, borderRadius: 12, padding: "9px 18px", color: dark ? "#e8b4bc" : "#C68A95", fontSize: 13, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 7 }}
          >
            <i className={`fa-solid ${creando ? "fa-xmark" : "fa-plus"}`} />
            {creando ? "Cancelar" : "Agregar"}
          </button>
        }
      />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 60px" }}>
        {error && (
          <div style={{ ...MONO, background: "#fff5f5", border: "1px solid #f5c6c6", color: "#c0392b", borderRadius: 12, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        {creando && (
          <form onSubmit={crear} style={{ background: c.cardBg, border: "1.5px solid #C68A95", borderRadius: 20, padding: "22px 24px", marginBottom: 20, boxShadow: "0 4px 30px rgba(198,138,149,0.18)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["tarea", "nota"] as const).map((tp) => (
                <button key={tp} type="button" onClick={() => setForm((f) => ({ ...f, tipo: tp }))}
                  style={{ ...MONO, padding: "8px 18px", borderRadius: 100, fontSize: 13, cursor: "pointer", border: `1.5px solid ${form.tipo === tp ? "#C68A95" : c.border}`, background: form.tipo === tp ? "rgba(198,138,149,0.14)" : "transparent", color: form.tipo === tp ? "#C68A95" : c.textMuted }}>
                  {tp === "tarea" ? "Tarea" : "Nota para recordar"}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>{form.tipo === "tarea" ? "¿Qué hay que hacer? *" : "Título *"}</label>
                <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} style={inputStyle} placeholder="Ej: Pedir reseñas a las clientas de esta semana" />
              </div>
              <div>
                <label style={labelStyle}>Detalle (opcional)</label>
                <textarea value={form.detalle} onChange={(e) => setForm((f) => ({ ...f, detalle: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              {form.tipo === "tarea" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Fecha límite</label>
                    <input type="date" value={form.vence} onChange={(e) => setForm((f) => ({ ...f, vence: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Responsable</label>
                    <select value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))} style={inputStyle}>
                      <option value="">Sin asignar</option>
                      {RESPONSABLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={guardando || !form.titulo.trim()}
              style={{ ...MONO, marginTop: 18, padding: "11px 26px", borderRadius: 100, border: "none", background: "#C68A95", color: "#fff", fontSize: 13, letterSpacing: "0.05em", cursor: guardando ? "wait" : "pointer", opacity: form.titulo.trim() ? 1 : 0.6 }}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </form>
        )}

        {cargando ? (
          <div style={{ ...MONO, textAlign: "center", padding: "60px 0", color: c.textMuted }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26, display: "block", marginBottom: 12 }} />
            Cargando…
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {[
                { label: "Pendientes", valor: pendientes.length, color: "#C68A95" },
                { label: "Vencidas", valor: vencidas, color: vencidas ? "#C0392B" : c.textMuted },
                { label: "Hechas", valor: hechas.length, color: "#66bb6a" },
              ].map((s) => (
                <div key={s.label} style={{ flex: 1, minWidth: 130, background: c.cardBg, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "14px 18px" }}>
                  <p style={{ ...MONO, margin: 0, fontSize: 11, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
                  <p style={{ ...MONO, margin: "4px 0 0", fontSize: 26, fontWeight: 700, color: s.color }}>{s.valor}</p>
                </div>
              ))}
            </div>

            {tituloSeccion("Tareas pendientes", pendientes.length)}
            {pendientes.length === 0 ? (
              <p style={{ ...MONO, color: c.textMuted, fontSize: 13 }}>No queda nada pendiente. ✨</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendientes.map((t) => (
                  <TareaCard key={t.id} t={t} c={c} abierta={abiertas.has(t.id)} onAbrir={() => alternar(t.id)} onToggle={() => toggle(t)} onBorrar={() => borrar(t)} onCambiar={(x) => cambiar(t, x)} />
                ))}
              </div>
            )}

            {tituloSeccion("Notas para recordar", notas.length)}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notas.map((t) => (
                <TareaCard key={t.id} t={t} c={c} abierta={false} onAbrir={() => {}} onToggle={() => {}} onBorrar={() => borrar(t)} onCambiar={() => {}} />
              ))}
              {notas.length === 0 && <p style={{ ...MONO, color: c.textMuted, fontSize: 13 }}>Sin notas por ahora.</p>}
            </div>

            {hechas.length > 0 && (
              <>
                <button onClick={() => setVerHechas((v) => !v)}
                  style={{ ...MONO, marginTop: 34, background: "none", border: "none", cursor: "pointer", color: c.textMuted, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className={`fa-solid fa-chevron-${verHechas ? "up" : "down"}`} /> Hechas ({hechas.length})
                </button>
                {verHechas && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                    {hechas.map((t) => (
                      <TareaCard key={t.id} t={t} c={c} abierta={abiertas.has(t.id)} onAbrir={() => alternar(t.id)} onToggle={() => toggle(t)} onBorrar={() => borrar(t)} onCambiar={(x) => cambiar(t, x)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
