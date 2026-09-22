"use client";

import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import AdminHeader from "../../AdminHeader";

type Faq = { q: string; a: string };

type PaginaServicio = {
  slug: string;
  nombre: string;
  lead: string;
  metaDescription: string;
  queEsTitulo: string;
  queEsTexto: string;
  sesion: string;
  paraTi: string[];
  faq: Faq[];
  waTexto: string;
};

export default function PaginasClient({
  initialPaginas, initialZonas,
}: {
  initialPaginas: PaginaServicio[];
  initialZonas: string[];
}) {
  const { dark } = useThemeStore();
  const [paginas, setPaginas] = useState<Record<string, PaginaServicio>>(
    Object.fromEntries(initialPaginas.map((p) => [p.slug, p]))
  );
  const [activo, setActivo] = useState(initialPaginas[0]?.slug ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [zonas, setZonas] = useState<string[]>(initialZonas);
  const [zonaInput, setZonaInput] = useState("");
  const [savingZonas, setSavingZonas] = useState(false);
  const [savedZonas, setSavedZonas] = useState(false);

  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fdfaf9";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: inputBg, border: `1.5px solid ${border}`,
    borderRadius: 10, padding: "10px 14px", color: textMain, fontSize: 13,
    fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box", resize: "vertical",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: 5, fontSize: 11, color: textMuted,
    letterSpacing: "0.1em", textTransform: "uppercase", ...MONO,
  };
  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
    borderRadius: 9, border: `1.5px solid ${border}`, background: cardBg, color: textMain,
    fontSize: 12, cursor: "pointer", ...MONO,
  };

  const p = paginas[activo];

  function set<K extends keyof PaginaServicio>(field: K, value: PaginaServicio[K]) {
    setPaginas((prev) => ({ ...prev, [activo]: { ...prev[activo], [field]: value } }));
  }

  function Field({ label, value, onChange, rows, hint }: {
    label: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string;
  }) {
    return (
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{label}</label>
        {rows ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={inputStyle} />
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
        )}
        {hint && <p style={{ margin: "4px 0 0", fontSize: 10, color: textMuted, ...MONO }}>{hint}</p>}
      </div>
    );
  }

  async function guardarPagina() {
    setSaving(activo);
    await fetch("/api/admin/servicios-contenido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: activo,
        value: {
          lead: p.lead, metaDescription: p.metaDescription,
          queEsTitulo: p.queEsTitulo, queEsTexto: p.queEsTexto,
          sesion: p.sesion, paraTi: p.paraTi, faq: p.faq, waTexto: p.waTexto,
        },
      }),
    });
    setSaving(null);
    setSaved(activo);
    setTimeout(() => setSaved(null), 2500);
  }

  async function guardarZonas() {
    setSavingZonas(true);
    await fetch("/api/admin/servicios-contenido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zonas }),
    });
    setSavingZonas(false);
    setSavedZonas(true);
    setTimeout(() => setSavedZonas(false), 2500);
  }

  function agregarZona() {
    const v = zonaInput.trim();
    if (!v || zonas.some((z) => z.toLowerCase() === v.toLowerCase())) { setZonaInput(""); return; }
    setZonas((prev) => [...prev, v]);
    setZonaInput("");
  }

  if (!p) return null;

  return (
    <>
      <AdminHeader
        eyebrow="Páginas de cada servicio"
        title="Editar textos de los servicios"
        backHref="/admin/servicios"
        subtitle="Lo que se muestra al pinchar cada servicio: qué incluye, la sesión, las zonas y las preguntas frecuentes."
      />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Zonas de atención — compartidas por todas las páginas */}
        <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 18, padding: 22, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 4px", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: "normal" }}>
            <i className="fa-solid fa-house-chimney" style={{ marginRight: 8, color: "#C68A95" }} />
            Zonas de atención a domicilio
          </h3>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: textMuted, ...MONO }}>
            Se usan en todas las páginas de servicios y en el inicio del sitio. Agrega o quita una comuna aquí y se actualiza en todas partes.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {zonas.map((z, i) => (
              <span key={z} style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px",
                borderRadius: 999, background: inputBg, border: `1.5px solid ${border}`, color: textMain, fontSize: 12, ...MONO,
              }}>
                {z}
                <button
                  onClick={() => setZonas((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}
                  aria-label={`Quitar ${z}`}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={zonaInput}
              onChange={(e) => setZonaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarZona(); } }}
              placeholder="Ej: Machalí"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={agregarZona} style={btnStyle}><i className="fa-solid fa-plus" /> Agregar</button>
          </div>
          <button
            onClick={guardarZonas}
            disabled={savingZonas}
            style={{
              marginTop: 14, padding: "10px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #D8A7B1, #C68A95)", color: "#fff",
              fontSize: 13, cursor: savingZonas ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8, ...MONO,
            }}
          >
            <i className={`fa-solid ${savingZonas ? "fa-spinner fa-spin" : savedZonas ? "fa-check" : "fa-floppy-disk"}`} />
            {savingZonas ? "Guardando…" : savedZonas ? "¡Guardado!" : "Guardar zonas"}
          </button>
        </div>

        {/* Selector de servicio */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {initialPaginas.map((pp) => (
            <button
              key={pp.slug}
              onClick={() => setActivo(pp.slug)}
              style={{
                ...btnStyle,
                background: activo === pp.slug ? "linear-gradient(135deg, #D8A7B1, #C68A95)" : cardBg,
                color: activo === pp.slug ? "#fff" : textMain,
                border: activo === pp.slug ? "1.5px solid transparent" : `1.5px solid ${border}`,
              }}
            >
              {pp.nombre}
            </button>
          ))}
        </div>

        {/* Editor del servicio activo */}
        <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 18, padding: 24 }}>
          <Field label="Introducción (bajo el título)" value={p.lead} onChange={(v) => set("lead", v)} rows={3} />
          <Field
            label="Descripción para Google"
            value={p.metaDescription}
            onChange={(v) => set("metaDescription", v)}
            rows={2}
            hint={`${p.metaDescription.length} caracteres — lo ideal es no pasar de 155, si es más largo Google lo corta.`}
          />
          <Field label="Título de la sección “¿Qué es…?”" value={p.queEsTitulo} onChange={(v) => set("queEsTitulo", v)} />
          <Field label="Texto de “¿Qué es…?”" value={p.queEsTexto} onChange={(v) => set("queEsTexto", v)} rows={4} />
          <Field label="Cómo es la sesión" value={p.sesion} onChange={(v) => set("sesion", v)} rows={3} />

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Es para ti si… (lo que incluye / a quién le sirve)</label>
            {p.paraTi.map((linea, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  value={linea}
                  onChange={(e) => {
                    const nuevo = [...p.paraTi];
                    nuevo[i] = e.target.value;
                    set("paraTi", nuevo);
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => set("paraTi", p.paraTi.filter((_, idx) => idx !== i))}
                  style={{ ...btnStyle, padding: "8px 12px", color: "#b04a5a" }}
                  aria-label="Quitar línea"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
            <button onClick={() => set("paraTi", [...p.paraTi, ""])} style={btnStyle}>
              <i className="fa-solid fa-plus" /> Agregar línea
            </button>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Preguntas frecuentes</label>
            {p.faq.map((f, i) => (
              <div key={i} style={{ border: `1.5px solid ${border}`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <input
                  type="text"
                  value={f.q}
                  placeholder="Pregunta"
                  onChange={(e) => {
                    const nuevo = [...p.faq];
                    nuevo[i] = { ...nuevo[i], q: e.target.value };
                    set("faq", nuevo);
                  }}
                  style={{ ...inputStyle, marginBottom: 8, fontWeight: 600 }}
                />
                <textarea
                  value={f.a}
                  placeholder="Respuesta"
                  rows={2}
                  onChange={(e) => {
                    const nuevo = [...p.faq];
                    nuevo[i] = { ...nuevo[i], a: e.target.value };
                    set("faq", nuevo);
                  }}
                  style={inputStyle}
                />
                <button
                  onClick={() => set("faq", p.faq.filter((_, idx) => idx !== i))}
                  style={{ ...btnStyle, padding: "6px 12px", marginTop: 8, color: "#b04a5a" }}
                >
                  <i className="fa-solid fa-trash" /> Quitar pregunta
                </button>
              </div>
            ))}
            <button onClick={() => set("faq", [...p.faq, { q: "", a: "" }])} style={btnStyle}>
              <i className="fa-solid fa-plus" /> Agregar pregunta
            </button>
          </div>

          <Field
            label="Mensaje al escribir por WhatsApp desde esta página"
            value={p.waTexto}
            onChange={(v) => set("waTexto", v)}
          />

          <button
            onClick={guardarPagina}
            disabled={saving === activo}
            style={{
              marginTop: 6, padding: "12px 26px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #D8A7B1, #C68A95)", color: "#fff",
              fontSize: 14, cursor: saving === activo ? "wait" : "pointer",
              display: "inline-flex", alignItems: "center", gap: 8, ...MONO,
            }}
          >
            <i className={`fa-solid ${saving === activo ? "fa-spinner fa-spin" : saved === activo ? "fa-check" : "fa-floppy-disk"}`} />
            {saving === activo ? "Guardando…" : saved === activo ? "¡Guardado!" : "Guardar esta página"}
          </button>
          <a
            href={`/${activo}?x=${Date.now()}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...btnStyle, marginLeft: 10 }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square" /> Ver la página
          </a>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: textMuted, textAlign: "center", ...MONO }}>
          Los cambios se ven en el sitio apenas guardas.
        </p>
      </div>
    </>
  );
}
