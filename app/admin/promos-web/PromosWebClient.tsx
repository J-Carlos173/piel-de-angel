"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import AdminHeader from "../AdminHeader";

type Promo = {
  id: number;
  tag: string;
  title: string;
  description: string;
  prizes: string[];
  cta: string;
  href: string;
  finalizado: boolean;
  activo: boolean;
  orden: number;
};

type Form = {
  tag: string; title: string; description: string; prizes: string[];
  cta: string; href: string; finalizado: boolean;
};

const BLANK: Form = { tag: "", title: "", description: "", prizes: [], cta: "Ver publicación", href: "", finalizado: false };

export default function PromosWebClient() {
  const { dark } = useThemeStore();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, Form>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [creando, setCreando] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<Form>(BLANK);
  const [creating, setCreating] = useState(false);

  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: inputBg, border: `1px solid ${border}`,
    borderRadius: 10, padding: "9px 12px", color: textMain,
    fontSize: 13, fontFamily: "Montserrat, sans-serif", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: textMuted, fontFamily: "Montserrat, sans-serif",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, display: "block",
  };
  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
    borderRadius: 9, border: `1.5px solid ${border}`, background: cardBg, color: textMain,
    fontSize: 12, cursor: "pointer", ...MONO,
  };

  function cargar() {
    fetch("/api/admin/promos-web")
      .then((r) => r.json())
      .then((data) => {
        const list: Promo[] = data.promos ?? [];
        setPromos(list);
        const init: typeof form = {};
        list.forEach((p) => {
          init[p.id] = {
            tag: p.tag, title: p.title, description: p.description,
            prizes: p.prizes, cta: p.cta, href: p.href, finalizado: p.finalizado,
          };
        });
        setForm(init);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(cargar, []);

  function updateField<K extends keyof Form>(id: number, field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function toggleActivo(p: Promo) {
    setToggling(p.id);
    await fetch("/api/admin/promos-web", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, activo: !p.activo }),
    });
    setPromos((prev) => prev.map((x) => (x.id === p.id ? { ...x, activo: !x.activo } : x)));
    setToggling(null);
  }

  async function guardar(id: number) {
    setSaving(id);
    const f = form[id];
    await fetch("/api/admin/promos-web", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...f }),
    });
    setSaving(null);
    setEditando(null);
    cargar();
  }

  async function eliminar(id: number) {
    setDeleting(id);
    await fetch("/api/admin/promos-web", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPromos((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  async function crear() {
    if (!nuevoForm.title.trim()) return;
    setCreating(true);
    await fetch("/api/admin/promos-web", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuevoForm, activo: true }),
    });
    setCreating(false);
    setCreando(false);
    setNuevoForm(BLANK);
    cargar();
  }

  function ListaPremios({ prizes, onChange }: { prizes: string[]; onChange: (p: string[]) => void }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Premios / detalles (opcional)</label>
        {prizes.map((linea, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <input
              type="text"
              value={linea}
              onChange={(e) => { const n = [...prizes]; n[i] = e.target.value; onChange(n); }}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={() => onChange(prizes.filter((_, idx) => idx !== i))} style={{ ...btnStyle, padding: "7px 11px", color: "#b04a5a" }}>
              <i className="fa-solid fa-trash" />
            </button>
          </div>
        ))}
        <button onClick={() => onChange([...prizes, ""])} style={btnStyle}>
          <i className="fa-solid fa-plus" /> Agregar línea
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <AdminHeader
        eyebrow="Sección Promociones del sitio"
        title="Concursos y avisos"
        backHref="/admin"
        subtitle="Las tarjetas que se ven en la sección Promociones de la página principal."
        rightExtra={
          <button
            onClick={() => setCreando((v) => !v)}
            style={{ background: dark ? "rgba(198,138,149,0.14)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`, borderRadius: 12, padding: "9px 18px", color: dark ? "#e8b4bc" : "#C68A95", fontSize: 13, cursor: "pointer", fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: 7 }}
          >
            <i className={`fa-solid ${creando ? "fa-xmark" : "fa-plus"}`} />
            {creando ? "Cancelar" : "Nueva promoción"}
          </button>
        }
      />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 60px" }}>
        <p style={{ fontSize: 13, color: textMuted, marginBottom: 20, ...MONO }}>
          Si una promoción está <strong>Oculta</strong>, no aparece en el sitio para nadie. Si quedan todas ocultas, la sección Promociones desaparece de la página.
        </p>

        {creando && (
          <div style={{ background: cardBg, border: `1.5px solid #C68A95`, borderRadius: 20, padding: 22, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: "normal" }}>
              Nueva promoción
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Etiqueta (ej: Concurso · Navidad)</label>
              <input type="text" value={nuevoForm.tag} onChange={(e) => setNuevoForm({ ...nuevoForm, tag: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Título</label>
              <input type="text" value={nuevoForm.title} onChange={(e) => setNuevoForm({ ...nuevoForm, title: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea value={nuevoForm.description} onChange={(e) => setNuevoForm({ ...nuevoForm, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <ListaPremios prizes={nuevoForm.prizes} onChange={(p) => setNuevoForm({ ...nuevoForm, prizes: p })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Texto del botón</label>
                <input type="text" value={nuevoForm.cta} onChange={(e) => setNuevoForm({ ...nuevoForm, cta: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Enlace (Instagram, etc.)</label>
                <input type="text" value={nuevoForm.href} onChange={(e) => setNuevoForm({ ...nuevoForm, href: e.target.value })} placeholder="https://instagram.com/p/..." style={inputStyle} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, fontSize: 13, color: textMain, ...MONO }}>
              <input type="checkbox" checked={nuevoForm.finalizado} onChange={(e) => setNuevoForm({ ...nuevoForm, finalizado: e.target.checked })} />
              Marcar como &quot;Finalizado&quot;
            </label>
            <button onClick={crear} disabled={creating || !nuevoForm.title.trim()} style={{
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #D8A7B1, #C68A95)", color: "#fff",
              fontSize: 13, cursor: creating ? "wait" : "pointer", ...MONO,
            }}>
              {creating ? "Creando…" : "Crear promoción"}
            </button>
          </div>
        )}

        {loading && <p style={{ color: textMuted, ...MONO }}>Cargando…</p>}
        {!loading && promos.length === 0 && <p style={{ color: textMuted, ...MONO }}>No hay promociones todavía.</p>}

        {promos.map((p) => {
          const f = form[p.id];
          if (!f) return null;
          const abierto = editando === p.id;
          return (
            <div key={p.id} style={{ background: cardBg, border: `1.5px solid ${p.activo ? border : textMuted}`, borderRadius: 18, padding: 20, marginBottom: 16, opacity: p.activo ? 1 : 0.7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  {p.tag && <p style={{ margin: "0 0 4px", fontSize: 11, color: "#C68A95", letterSpacing: "0.06em", ...MONO }}>{p.tag}</p>}
                  <h3 style={{ margin: 0, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 19, fontWeight: "normal" }}>
                    {p.title}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggleActivo(p)}
                    disabled={toggling === p.id}
                    style={{
                      ...btnStyle,
                      background: p.activo ? "rgba(120,170,120,0.15)" : "rgba(198,138,149,0.12)",
                      border: `1.5px solid ${p.activo ? "#7aa87a" : "#C68A95"}`,
                      color: p.activo ? "#4c7a4c" : "#C68A95",
                      cursor: toggling === p.id ? "wait" : "pointer",
                    }}
                  >
                    <i className={`fa-solid ${p.activo ? "fa-eye" : "fa-eye-slash"}`} />
                    {p.activo ? "Visible en el sitio" : "Oculta"}
                  </button>
                  <button onClick={() => setEditando(abierto ? null : p.id)} style={btnStyle}>
                    <i className={`fa-solid ${abierto ? "fa-xmark" : "fa-pen"}`} /> {abierto ? "Cerrar" : "Editar"}
                  </button>
                  <button onClick={() => eliminar(p.id)} disabled={deleting === p.id} style={{ ...btnStyle, color: "#b04a5a" }}>
                    <i className="fa-solid fa-trash" /> {deleting === p.id ? "…" : "Borrar"}
                  </button>
                </div>
              </div>

              {abierto && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${border}` }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Etiqueta</label>
                    <input type="text" value={f.tag} onChange={(e) => updateField(p.id, "tag", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Título</label>
                    <input type="text" value={f.title} onChange={(e) => updateField(p.id, "title", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea value={f.description} onChange={(e) => updateField(p.id, "description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <ListaPremios prizes={f.prizes} onChange={(pr) => updateField(p.id, "prizes", pr)} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Texto del botón</label>
                      <input type="text" value={f.cta} onChange={(e) => updateField(p.id, "cta", e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Enlace</label>
                      <input type="text" value={f.href} onChange={(e) => updateField(p.id, "href", e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, fontSize: 13, color: textMain, ...MONO }}>
                    <input type="checkbox" checked={f.finalizado} onChange={(e) => updateField(p.id, "finalizado", e.target.checked)} />
                    Marcar como &quot;Finalizado&quot;
                  </label>
                  <button onClick={() => guardar(p.id)} disabled={saving === p.id} style={{
                    padding: "10px 22px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #D8A7B1, #C68A95)", color: "#fff",
                    fontSize: 13, cursor: saving === p.id ? "wait" : "pointer", ...MONO,
                  }}>
                    {saving === p.id ? "Guardando…" : "Guardar cambios"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
