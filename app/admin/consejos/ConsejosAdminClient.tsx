"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import AdminHeader from "../AdminHeader";

type Consejo = {
  id: number;
  categoria: string;
  titulo: string;
  texto: string;
  fuente: string;
  imagen: string;
  icono: string;
  activo: boolean;
  orden: number;
};

type Form = {
  categoria: string; titulo: string; texto: string; fuente: string; imagen: string; icono: string;
};

const BLANK: Form = { categoria: "", titulo: "", texto: "", fuente: "", imagen: "", icono: "" };

const ICONOS = [
  { label: "Sol", valor: "fa-solid fa-sun" },
  { label: "Luna", valor: "fa-solid fa-moon" },
  { label: "Gota", valor: "fa-solid fa-droplet" },
  { label: "Brillos", valor: "fa-solid fa-sparkles" },
  { label: "Frasco", valor: "fa-solid fa-flask" },
  { label: "Capas", valor: "fa-solid fa-layer-group" },
  { label: "Clima", valor: "fa-solid fa-cloud-sun" },
  { label: "Descanso", valor: "fa-solid fa-bed" },
];

export default function ConsejosAdminClient() {
  const { dark } = useThemeStore();
  const [consejos, setConsejos] = useState<Consejo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, Form>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [subiendo, setSubiendo] = useState<number | "nuevo" | null>(null);
  const [errorFoto, setErrorFoto] = useState<Record<number | "nuevo", string>>({} as Record<number | "nuevo", string>);

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
    fetch("/api/admin/consejos")
      .then((r) => r.json())
      .then((data) => {
        const list: Consejo[] = data.consejos ?? [];
        setConsejos(list);
        const init: typeof form = {};
        list.forEach((c) => {
          init[c.id] = { categoria: c.categoria, titulo: c.titulo, texto: c.texto, fuente: c.fuente, imagen: c.imagen, icono: c.icono };
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

  // Las fotos del celular pesan varios MB: se achican antes de subir.
  async function reducirImagen(file: File, maxLado = 1400): Promise<File> {
    const bmp = await createImageBitmap(file);
    const escala = Math.min(1, maxLado / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  }

  async function subirFoto(id: number | "nuevo", file: File, onChange: (v: string) => void) {
    setSubiendo(id);
    setErrorFoto((prev) => ({ ...prev, [id]: "" }));
    try {
      const fd = new FormData();
      fd.append("file", await reducirImagen(file));
      fd.append("folder", "consejos");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "No se pudo subir");
      onChange(data.url);
    } catch {
      setErrorFoto((prev) => ({ ...prev, [id]: "No se pudo subir la foto. Prueba con otra o inténtalo de nuevo." }));
    }
    setSubiendo(null);
  }

  async function toggleActivo(c: Consejo) {
    setToggling(c.id);
    await fetch("/api/admin/consejos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, activo: !c.activo }),
    });
    setConsejos((prev) => prev.map((x) => (x.id === c.id ? { ...x, activo: !x.activo } : x)));
    setToggling(null);
  }

  async function guardar(id: number) {
    setSaving(id);
    await fetch("/api/admin/consejos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form[id] }),
    });
    setSaving(null);
    setEditando(null);
    cargar();
  }

  async function eliminar(id: number) {
    setDeleting(id);
    await fetch("/api/admin/consejos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConsejos((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  async function crear() {
    if (!nuevoForm.titulo.trim()) return;
    setCreating(true);
    await fetch("/api/admin/consejos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuevoForm, activo: true }),
    });
    setCreating(false);
    setCreando(false);
    setNuevoForm(BLANK);
    cargar();
  }

  function CampoFoto({ id, imagen, icono, onImagen, onIcono }: {
    id: number | "nuevo"; imagen: string; icono: string;
    onImagen: (v: string) => void; onIcono: (v: string) => void;
  }) {
    const ocupado = subiendo === id;
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Foto (opcional)</label>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
          <input type="text" value={imagen} onChange={(e) => onImagen(e.target.value)} placeholder="https://..." style={{ ...inputStyle, flex: 1 }} />
          {imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagen} alt="preview" style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8, border: `1.5px solid ${border}`, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>
        <label style={{ ...btnStyle, cursor: ocupado ? "wait" : "pointer", opacity: ocupado ? 0.6 : 1 }}>
          <i className={`fa-solid ${ocupado ? "fa-spinner fa-spin" : "fa-camera"}`} />
          {ocupado ? "Subiendo…" : "Subir foto"}
          <input type="file" accept="image/*" disabled={ocupado} style={{ display: "none" }} onChange={(e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (f) subirFoto(id, f, onImagen);
          }} />
        </label>
        {errorFoto[id] && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#b04a5a", ...MONO }}>{errorFoto[id]}</p>}

        {!imagen && (
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Sin foto: ícono de respaldo</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ICONOS.map((ic) => (
                <button key={ic.valor} onClick={() => onIcono(ic.valor)} style={{
                  ...btnStyle, padding: "6px 12px",
                  background: icono === ic.valor ? "rgba(198,138,149,0.15)" : cardBg,
                  border: `1.5px solid ${icono === ic.valor ? "#C68A95" : border}`,
                }}>
                  <i className={ic.valor} /> {ic.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <AdminHeader
        eyebrow="Sección Consejos de piel"
        title="Consejos de piel"
        backHref="/admin"
        subtitle="Lo que se ve en el inicio y en pieldeangel.cl/consejos."
        rightExtra={
          <button
            onClick={() => setCreando((v) => !v)}
            style={{ background: dark ? "rgba(198,138,149,0.14)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`, borderRadius: 12, padding: "9px 18px", color: dark ? "#e8b4bc" : "#C68A95", fontSize: 13, cursor: "pointer", fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: 7 }}
          >
            <i className={`fa-solid ${creando ? "fa-xmark" : "fa-plus"}`} />
            {creando ? "Cancelar" : "Nuevo consejo"}
          </button>
        }
      />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 16px 60px" }}>
        <p style={{ fontSize: 13, color: textMuted, marginBottom: 20, ...MONO }}>
          Si un consejo está <strong>Oculto</strong>, no aparece en el sitio. El carrusel va rotando solo entre los que estén visibles.
        </p>

        {creando && (
          <div style={{ background: cardBg, border: "1.5px solid #C68A95", borderRadius: 20, padding: 22, marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: "normal" }}>
              Nuevo consejo
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Categoría (ej: Hidratación)</label>
              <input type="text" value={nuevoForm.categoria} onChange={(e) => setNuevoForm({ ...nuevoForm, categoria: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Título</label>
              <input type="text" value={nuevoForm.titulo} onChange={(e) => setNuevoForm({ ...nuevoForm, titulo: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Texto</label>
              <textarea value={nuevoForm.texto} onChange={(e) => setNuevoForm({ ...nuevoForm, texto: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Fuente (ej: Academia Americana de Dermatología)</label>
              <input type="text" value={nuevoForm.fuente} onChange={(e) => setNuevoForm({ ...nuevoForm, fuente: e.target.value })} style={inputStyle} />
            </div>
            <CampoFoto
              id="nuevo" imagen={nuevoForm.imagen} icono={nuevoForm.icono}
              onImagen={(v) => setNuevoForm({ ...nuevoForm, imagen: v })}
              onIcono={(v) => setNuevoForm({ ...nuevoForm, icono: v })}
            />
            <button onClick={crear} disabled={creating || !nuevoForm.titulo.trim()} style={{
              padding: "10px 22px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #D8A7B1, #C68A95)", color: "#fff",
              fontSize: 13, cursor: creating ? "wait" : "pointer", ...MONO,
            }}>
              {creating ? "Creando…" : "Crear consejo"}
            </button>
          </div>
        )}

        {loading && <p style={{ color: textMuted, ...MONO }}>Cargando…</p>}
        {!loading && consejos.length === 0 && <p style={{ color: textMuted, ...MONO }}>No hay consejos todavía.</p>}

        {consejos.map((c) => {
          const f = form[c.id];
          if (!f) return null;
          const abierto = editando === c.id;
          return (
            <div key={c.id} style={{ background: cardBg, border: `1.5px solid ${c.activo ? border : textMuted}`, borderRadius: 18, padding: 20, marginBottom: 16, opacity: c.activo ? 1 : 0.7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  {c.categoria && <p style={{ margin: "0 0 4px", fontSize: 11, color: "#C68A95", letterSpacing: "0.06em", ...MONO }}>{c.categoria}</p>}
                  <h3 style={{ margin: 0, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 19, fontWeight: "normal" }}>
                    {c.titulo}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggleActivo(c)}
                    disabled={toggling === c.id}
                    style={{
                      ...btnStyle,
                      background: c.activo ? "rgba(120,170,120,0.15)" : "rgba(198,138,149,0.12)",
                      border: `1.5px solid ${c.activo ? "#7aa87a" : "#C68A95"}`,
                      color: c.activo ? "#4c7a4c" : "#C68A95",
                      cursor: toggling === c.id ? "wait" : "pointer",
                    }}
                  >
                    <i className={`fa-solid ${c.activo ? "fa-eye" : "fa-eye-slash"}`} />
                    {c.activo ? "Visible en el sitio" : "Oculto"}
                  </button>
                  <button onClick={() => setEditando(abierto ? null : c.id)} style={btnStyle}>
                    <i className={`fa-solid ${abierto ? "fa-xmark" : "fa-pen"}`} /> {abierto ? "Cerrar" : "Editar"}
                  </button>
                  <button onClick={() => eliminar(c.id)} disabled={deleting === c.id} style={{ ...btnStyle, color: "#b04a5a" }}>
                    <i className="fa-solid fa-trash" /> {deleting === c.id ? "…" : "Borrar"}
                  </button>
                </div>
              </div>

              {abierto && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${border}` }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Categoría</label>
                    <input type="text" value={f.categoria} onChange={(e) => updateField(c.id, "categoria", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Título</label>
                    <input type="text" value={f.titulo} onChange={(e) => updateField(c.id, "titulo", e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Texto</label>
                    <textarea value={f.texto} onChange={(e) => updateField(c.id, "texto", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Fuente</label>
                    <input type="text" value={f.fuente} onChange={(e) => updateField(c.id, "fuente", e.target.value)} style={inputStyle} />
                  </div>
                  <CampoFoto
                    id={c.id} imagen={f.imagen} icono={f.icono}
                    onImagen={(v) => updateField(c.id, "imagen", v)}
                    onIcono={(v) => updateField(c.id, "icono", v)}
                  />
                  <button onClick={() => guardar(c.id)} disabled={saving === c.id} style={{
                    padding: "10px 22px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #D8A7B1, #C68A95)", color: "#fff",
                    fontSize: 13, cursor: saving === c.id ? "wait" : "pointer", ...MONO,
                  }}>
                    {saving === c.id ? "Guardando…" : "Guardar cambios"}
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
