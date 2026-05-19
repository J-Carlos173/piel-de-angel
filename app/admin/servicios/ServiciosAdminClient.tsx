"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Servicio = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  precio: number;
  duracion: number;
  categoria: string;
  orden: number;
};

type NuevoForm = {
  title: string; description: string; precio: string;
  duracion: string; categoria: string; orden: string;
};

const BLANK: NuevoForm = { title: "", description: "", precio: "", duracion: "", categoria: "", orden: "0" };

const CATEGORIAS = ["Facial", "Pestañas", "Corporal", "Hidratación", "Tratamiento", "Bienestar", "Skincare"];

function fmtPrecio(n: number) {
  return n > 0 ? "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "Consultar";
}

export default function ServiciosAdminClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { title: string; description: string; precio: string; duracion: string; categoria: string; orden: string }>>({});

  const [creando, setCreando] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<NuevoForm>(BLANK);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editImageFile, setEditImageFile] = useState<Record<string, File>>({});
  const [editImagePreview, setEditImagePreview] = useState<Record<string, string>>({});
  const editFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("");

  const bg       = dark ? "#160f13" : "#f5eeec";
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

  useEffect(() => {
    fetch("/api/admin/servicios")
      .then((r) => r.json())
      .then((data) => {
        const svcs = data.servicios ?? [];
        setServicios(svcs);
        const init: typeof form = {};
        svcs.forEach((s: Servicio) => {
          init[s.id] = {
            title: s.title ?? "",
            description: s.description ?? "",
            precio: s.precio ? String(s.precio) : "",
            duracion: s.duracion ? String(s.duracion) : "",
            categoria: s.categoria ?? "",
            orden: String(s.orden ?? 0),
          };
        });
        setForm(init);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function updateField(id: string, field: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function guardar(id: string) {
    setSaving(id);
    const f = form[id];
    let thumbnail: string | undefined;
    if (editImageFile[id]) {
      const fd = new FormData();
      fd.append("file", editImageFile[id]);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (upRes.ok) thumbnail = (await upRes.json()).url;
    }
    await fetch("/api/admin/servicios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id, title: f.title, description: f.description,
        precio: f.precio ? Number(f.precio) : 0,
        duracion: f.duracion ? Number(f.duracion) : 0,
        categoria: f.categoria,
        orden: Number(f.orden ?? 0),
        ...(thumbnail && { thumbnail }),
      }),
    });
    setSaving(null);
    setSaved(id);
    setEditando(null);
    setEditImageFile((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setEditImagePreview((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setTimeout(() => setSaved(null), 2500);
    setServicios((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, title: f.title, description: f.description,
              precio: Number(f.precio ?? 0), duracion: Number(f.duracion ?? 0),
              categoria: f.categoria, orden: Number(f.orden ?? 0),
              ...(thumbnail && { thumbnail }) }
          : s
      )
    );
  }

  async function toggleStatus(id: string, current: string) {
    setToggling(id);
    const newStatus = current === "published" ? "draft" : "published";
    await fetch("/api/admin/servicios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setServicios((prev) => prev.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    setToggling(null);
  }

  async function eliminar(id: string, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    await fetch("/api/admin/servicios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setServicios((prev) => prev.filter((s) => s.id !== id));
    setEditando(null);
    setDeleting(null);
  }

  async function crear() {
    if (!nuevoForm.title.trim()) { setCreateError("El nombre es obligatorio."); return; }
    setCreating(true);
    setCreateError(null);
    try {
      let thumbnail: string | undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (upRes.ok) thumbnail = (await upRes.json()).url;
      }
      const res = await fetch("/api/admin/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nuevoForm.title,
          description: nuevoForm.description,
          precio: nuevoForm.precio ? Number(nuevoForm.precio) : 0,
          duracion: nuevoForm.duracion ? Number(nuevoForm.duracion) : 0,
          categoria: nuevoForm.categoria,
          orden: Number(nuevoForm.orden ?? 0),
          thumbnail,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.servicio) { setCreateError("Error al crear el servicio."); return; }
      const s = data.servicio;
      setServicios((prev) => [...prev, s]);
      setForm((prev) => ({
        ...prev,
        [s.id]: {
          title: s.title, description: s.description ?? "",
          precio: s.precio ? String(s.precio) : "",
          duracion: s.duracion ? String(s.duracion) : "",
          categoria: s.categoria ?? "",
          orden: String(s.orden ?? 0),
        },
      }));
      setNuevoForm(BLANK);
      setImageFile(null);
      setImagePreview(null);
      setCreando(false);
    } catch {
      setCreateError("Error de conexión.");
    } finally {
      setCreating(false);
    }
  }

  const categorias = Array.from(new Set(servicios.map((s) => s.categoria).filter(Boolean)));
  const filtrados = servicios.filter((s) => {
    if (busqueda && !s.title.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroCat && (s.categoria ?? "") !== filtroCat) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
        padding: "32px 32px 28px", position: "relative", overflow: "hidden",
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #ecddd9",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #D8A7B1, #C68A95, #D8A7B1, transparent)" }} />
        <svg aria-hidden style={{ position: "absolute", right: 0, top: -8, opacity: dark ? 0.07 : 0.08, width: 150, pointerEvents: "none" }} viewBox="0 0 220 320">
          <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#C68A95"/>
          <path d="M110,10 C105,80 108,175 108,268" stroke="#8B6F6F" strokeWidth="2" fill="none" opacity={0.4}/>
        </svg>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Gestión de Servicios</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#f0dde6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Servicios</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => { setCreando((v) => !v); setCreateError(null); }}
              style={{ background: dark ? "rgba(198,138,149,0.14)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`, borderRadius: 12, padding: "9px 18px", color: dark ? "#e8b4bc" : "#C68A95", fontSize: 13, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 7 }}
            >
              <i className={`fa-solid ${creando ? "fa-xmark" : "fa-plus"}`} />
              {creando ? "Cancelar" : "Nuevo Servicio"}
            </button>
            <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer" }}>
              <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Formulario nuevo servicio */}
        {creando && (
          <div style={{ background: cardBg, border: `1.5px solid #C68A95`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 30px rgba(198,138,149,0.18)", marginBottom: 28 }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-spa" style={{ color: "#C68A95", fontSize: 16 }} />
              <span style={{ fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Nuevo Servicio</span>
            </div>

            <div style={{ padding: "24px", display: "flex", gap: 24, flexWrap: "wrap" }}>

              {/* Imagen */}
              <div style={{ flexShrink: 0 }}>
                <label style={labelStyle}>Imagen</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: 140, height: 140, borderRadius: 14, border: `2px dashed ${imagePreview ? "#C68A95" : border}`, background: imagePreview ? "transparent" : inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ textAlign: "center", color: textMuted }}>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, display: "block", marginBottom: 6 }} />
                        <span style={{ fontSize: 11, ...MONO }}>Subir imagen</span>
                      </div>
                  }
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setImageFile(f); setImagePreview(URL.createObjectURL(f)); }} style={{ display: "none" }} />
                {imagePreview && (
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ marginTop: 6, fontSize: 11, color: textMuted, background: "none", border: "none", cursor: "pointer", ...MONO }}>
                    <i className="fa-solid fa-trash" style={{ marginRight: 4 }} />Quitar
                  </button>
                )}
              </div>

              {/* Campos */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Nombre del servicio *</label>
                    <input type="text" placeholder="Ej: Lifting de Pestañas" value={nuevoForm.title} onChange={(e) => setNuevoForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Precio CLP</label>
                    <input type="number" min="0" placeholder="25000" value={nuevoForm.precio} onChange={(e) => setNuevoForm((f) => ({ ...f, precio: e.target.value }))} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Duración (min)</label>
                    <input type="number" min="0" placeholder="60" value={nuevoForm.duracion} onChange={(e) => setNuevoForm((f) => ({ ...f, duracion: e.target.value }))} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <select value={nuevoForm.categoria} onChange={(e) => setNuevoForm((f) => ({ ...f, categoria: e.target.value }))} style={inputStyle}>
                      <option value="">Sin categoría</option>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Orden</label>
                    <input type="number" min="0" placeholder="0" value={nuevoForm.orden} onChange={(e) => setNuevoForm((f) => ({ ...f, orden: e.target.value }))} style={inputStyle} />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea placeholder="Describe el servicio..." value={nuevoForm.description} onChange={(e) => setNuevoForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>

                </div>

                {createError && (
                  <p style={{ marginTop: 10, fontSize: 12, color: "#e57373", ...MONO }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5 }} />{createError}
                  </p>
                )}

                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={crear}
                    disabled={creating}
                    style={{ background: "linear-gradient(135deg, #C68A95, #8B5E6A)", border: "none", borderRadius: 10, padding: "10px 28px", color: "#fff", fontSize: 13, cursor: creating ? "wait" : "pointer", ...MONO, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {creating
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Creando...</>
                      : <><i className="fa-solid fa-sparkles" /> Crear Servicio</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        {!loading && servicios.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textMuted, fontSize: 13 }} />
              <input type="text" placeholder="Buscar servicio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
            <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {(busqueda || filtroCat) && (
              <button onClick={() => { setBusqueda(""); setFiltroCat(""); }} style={{ fontSize: 11, color: textMuted, background: "none", border: "none", cursor: "pointer", ...MONO }}>
                <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />Limpiar
              </button>
            )}
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted, ...MONO }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: "block" }} />
            Cargando servicios...
          </div>
        ) : servicios.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: textMuted }}>
            <i className="fa-solid fa-spa" style={{ fontSize: 44, opacity: 0.3, display: "block", marginBottom: 14 }} />
            <p style={{ ...MONO, fontSize: 14 }}>Aún no hay servicios. Crea el primero.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtrados.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, ...MONO, fontSize: 13 }}>
                <i className="fa-solid fa-filter" style={{ fontSize: 22, display: "block", marginBottom: 10 }} />
                Sin resultados.
              </div>
            )}
            {filtrados.map((s) => {
              const f = form[s.id] ?? { title: s.title, description: s.description, precio: String(s.precio), duracion: String(s.duracion), categoria: s.categoria, orden: String(s.orden) };
              const isEditing = editando === s.id;
              const isSaving = saving === s.id;
              const wasSaved = saved === s.id;
              const isPublished = s.status === "published";
              const isToggling = toggling === s.id;

              return (
                <div key={s.id} style={{ background: cardBg, border: `1.5px solid ${isPublished ? border : textMuted}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", opacity: isPublished ? 1 : 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>

                    {/* Imagen */}
                    <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(198,138,149,0.1)", border: `1px solid ${border}` }}>
                      {s.thumbnail
                        ? <img src={s.thumbnail} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fa-solid fa-spa" style={{ color: textMuted, fontSize: 20 }} />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: "normal" }}>{s.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: textMuted, ...MONO }}>
                        {f.categoria || "Sin categoría"}
                        {f.precio ? ` · ${fmtPrecio(Number(f.precio))}` : " · Consultar"}
                        {f.duracion ? ` · ${f.duracion} min` : ""}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {wasSaved && <span style={{ fontSize: 11, color: "#81c784", ...MONO }}><i className="fa-solid fa-check" /> Guardado</span>}
                      <button
                        onClick={() => toggleStatus(s.id, s.status)}
                        disabled={isToggling}
                        title={isPublished ? "Ocultar del sitio" : "Publicar en el sitio"}
                        style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 12px", color: textMuted, fontSize: 12, cursor: isToggling ? "wait" : "pointer", ...MONO }}
                      >
                        {isToggling
                          ? <i className="fa-solid fa-spinner fa-spin" />
                          : isPublished
                            ? <><i className="fa-solid fa-eye-slash" style={{ marginRight: 5 }} />Ocultar</>
                            : <><i className="fa-solid fa-eye" style={{ marginRight: 5 }} />Publicar</>}
                      </button>
                      <button
                        onClick={() => setEditando(isEditing ? null : s.id)}
                        style={{ background: isEditing ? "rgba(198,138,149,0.15)" : "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 14px", color: "#C68A95", fontSize: 12, cursor: "pointer", ...MONO }}
                      >
                        {isEditing ? "Cerrar" : <><i className="fa-solid fa-pen" style={{ marginRight: 5 }} />Editar</>}
                      </button>
                    </div>
                  </div>

                  {/* Panel edición */}
                  {isEditing && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: "20px 24px", background: dark ? "rgba(0,0,0,0.15)" : "rgba(198,138,149,0.04)" }}>

                      {/* Cambio de imagen */}
                      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          onClick={() => editFileRefs.current[s.id]?.click()}
                          style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: `2px dashed ${editImagePreview[s.id] ? "#C68A95" : border}`, background: inputBg, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {editImagePreview[s.id]
                            ? <img src={editImagePreview[s.id]} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : s.thumbnail
                              ? <img src={s.thumbnail} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <i className="fa-solid fa-spa" style={{ color: textMuted, fontSize: 22 }} />
                          }
                        </div>
                        <div>
                          <button
                            onClick={() => editFileRefs.current[s.id]?.click()}
                            style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 14px", color: textMuted, fontSize: 12, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <i className="fa-solid fa-cloud-arrow-up" /> {editImagePreview[s.id] ? "Cambiar imagen" : "Subir nueva imagen"}
                          </button>
                          {editImagePreview[s.id] && (
                            <button onClick={() => { setEditImageFile((v) => { const n = { ...v }; delete n[s.id]; return n; }); setEditImagePreview((v) => { const n = { ...v }; delete n[s.id]; return n; }); }} style={{ marginTop: 4, fontSize: 11, color: "#e57373", background: "none", border: "none", cursor: "pointer", ...MONO }}>
                              <i className="fa-solid fa-xmark" style={{ marginRight: 3 }} />Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="file" accept="image/*"
                          ref={(el) => { editFileRefs.current[s.id] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setEditImageFile((prev) => ({ ...prev, [s.id]: file }));
                            setEditImagePreview((prev) => ({ ...prev, [s.id]: URL.createObjectURL(file) }));
                          }}
                          style={{ display: "none" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Nombre del servicio</label>
                          <input type="text" value={f.title} onChange={(e) => updateField(s.id, "title", e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Precio CLP</label>
                          <input type="number" min="0" value={f.precio} onChange={(e) => updateField(s.id, "precio", e.target.value)} placeholder="0 = Consultar" style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Duración (min)</label>
                          <input type="number" min="0" value={f.duracion} onChange={(e) => updateField(s.id, "duracion", e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Categoría</label>
                          <select value={f.categoria} onChange={(e) => updateField(s.id, "categoria", e.target.value)} style={inputStyle}>
                            <option value="">Sin categoría</option>
                            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Orden</label>
                          <input type="number" min="0" value={f.orden} onChange={(e) => updateField(s.id, "orden", e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Descripción</label>
                          <textarea value={f.description} onChange={(e) => updateField(s.id, "description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                        </div>
                      </div>

                      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button
                          onClick={() => eliminar(s.id, s.title)}
                          disabled={deleting === s.id}
                          style={{ background: "transparent", border: "1px solid #e57373", borderRadius: 10, padding: "9px 18px", color: "#e57373", fontSize: 12, cursor: deleting === s.id ? "wait" : "pointer", ...MONO, display: "flex", alignItems: "center", gap: 7 }}
                        >
                          {deleting === s.id ? <><i className="fa-solid fa-spinner fa-spin" /> Eliminando...</> : <><i className="fa-solid fa-trash" /> Eliminar servicio</>}
                        </button>
                        <button
                          onClick={() => guardar(s.id)}
                          disabled={isSaving}
                          style={{ background: "linear-gradient(135deg, #C68A95, #8B5E6A)", border: "none", borderRadius: 10, padding: "10px 28px", color: "#fff", fontSize: 13, cursor: isSaving ? "wait" : "pointer", ...MONO, display: "flex", alignItems: "center", gap: 8 }}
                        >
                          {isSaving ? <><i className="fa-solid fa-spinner fa-spin" /> Guardando...</> : <><i className="fa-solid fa-floppy-disk" /> Guardar cambios</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
