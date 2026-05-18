"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Producto = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  precio: number;
  stock: number;
  categoria: string;
  badge: string;
};

type NuevoForm = {
  title: string; description: string; precio: string;
  stock: string; categoria: string; badge: string;
};

const BLANK_NUEVO: NuevoForm = { title: "", description: "", precio: "", stock: "0", categoria: "", badge: "" };

function fmtPrecio(n: number) {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function ProductosAdminClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { stock: string; precio: string; categoria: string; badge: string; title: string; description: string }>>({});

  // Nuevo producto
  const [creando, setCreando] = useState(false);
  const [nuevoForm, setNuevoForm] = useState<NuevoForm>(BLANK_NUEVO);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "stock" | "agotado">("todos");

  // Cambio de imagen en edición
  const [editImageFile, setEditImageFile] = useState<Record<string, File>>({});
  const [editImagePreview, setEditImagePreview] = useState<Record<string, string>>({});
  const editFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  useEffect(() => {
    fetch("/api/admin/productos")
      .then((r) => r.json())
      .then((data) => {
        const prods = data.products ?? [];
        setProductos(prods);
        const initialForm: typeof form = {};
        prods.forEach((p: Producto) => {
          initialForm[p.id] = {
            stock: String(p.stock ?? 0),
            precio: p.precio ? String(p.precio) : "",
            categoria: p.categoria ?? "",
            badge: p.badge ?? "",
            title: p.title ?? "",
            description: p.description ?? "",
          };
        });
        setForm(initialForm);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function guardar(id: string) {
    setSaving(id);
    const f = form[id];

    let thumbnail: string | undefined;
    if (editImageFile[id]) {
      const fd = new FormData();
      fd.append("file", editImageFile[id]);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (upRes.ok) {
        const upData = await upRes.json();
        thumbnail = upData.url;
      }
    }

    await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id, title: f.title, description: f.description,
        stock: Number(f.stock),
        precio: f.precio ? Number(f.precio) : undefined,
        categoria: f.categoria, badge: f.badge,
        ...(thumbnail && { thumbnail }),
      }),
    });
    setSaving(null);
    setSaved(id);
    setEditando(null);
    setEditImageFile((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setEditImagePreview((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setTimeout(() => setSaved(null), 2500);
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: f.title, description: f.description,
              ...(thumbnail && { thumbnail }),
              stock: Number(f.stock), categoria: f.categoria, badge: f.badge }
          : p
      )
    );
  }

  function updateField(id: string, field: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function toggleStatus(id: string, currentStatus: string) {
    setToggling(id);
    const newStatus = currentStatus === "published" ? "draft" : "published";
    await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setProductos((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    setToggling(null);
  }

  async function eliminar(id: string, title: string) {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    await fetch("/api/admin/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProductos((prev) => prev.filter((p) => p.id !== id));
    setEditando(null);
    setDeleting(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function crear() {
    if (!nuevoForm.title.trim()) { setCreateError("El nombre es obligatorio."); return; }
    setCreatingProduct(true);
    setCreateError(null);
    try {
      let thumbnail: string | undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          thumbnail = upData.url;
        }
      }
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nuevoForm.title,
          description: nuevoForm.description,
          precio: nuevoForm.precio ? Number(nuevoForm.precio) : undefined,
          stock: Number(nuevoForm.stock),
          categoria: nuevoForm.categoria,
          badge: nuevoForm.badge,
          thumbnail,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.product) { setCreateError("Error al crear el producto. Intenta de nuevo."); return; }

      const p = data.product;
      setProductos((prev) => [p, ...prev]);
      setForm((prev) => ({
        ...prev,
        [p.id]: {
          stock: String(p.stock ?? nuevoForm.stock),
          precio: p.precio ? String(p.precio) : nuevoForm.precio,
          categoria: p.categoria ?? nuevoForm.categoria,
          badge: p.badge ?? nuevoForm.badge,
          title: p.title,
          description: p.description ?? "",
        },
      }));
      setNuevoForm(BLANK_NUEVO);
      setImageFile(null);
      setImagePreview(null);
      setCreando(false);
    } catch {
      setCreateError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCreatingProduct(false);
    }
  }

  const categorias = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean)));

  const productosFiltrados = productos.filter((p) => {
    const f = form[p.id];
    const stock = Number(f?.stock ?? p.stock ?? 0);
    if (busqueda && !p.title.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroCat && (f?.categoria || p.categoria || "") !== filtroCat) return false;
    if (filtroEstado === "stock" && stock <= 0) return false;
    if (filtroEstado === "agotado" && stock > 0) return false;
    return true;
  });

  const inputStyle: React.CSSProperties = {
    width: "100%", background: inputBg, border: `1px solid ${border}`,
    borderRadius: 10, padding: "9px 12px", color: textMain,
    fontSize: 13, fontFamily: "Montserrat, sans-serif", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, color: textMuted, fontFamily: "Montserrat, sans-serif",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #f6fbf7 60%, #eef7ef 100%)",
        padding: "32px 32px 28px", position: "relative", overflow: "hidden",
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #c5dcc6",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #7FA882, #5B7E64, #7FA882, transparent)" }} />
        <svg aria-hidden style={{ position: "absolute", right: 0, top: -8, opacity: dark ? 0.07 : 0.08, width: 150, pointerEvents: "none" }} viewBox="0 0 220 320">
          <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#4A6B52"/>
          <path d="M110,10 C105,80 108,175 108,268" stroke="#2E4D35" strokeWidth="2" fill="none" opacity={0.4}/>
        </svg>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(91,126,100,0.10)", border: `1px solid ${dark ? "#3a2830" : "#c5dcc6"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#4A6B52", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#7A9E8A", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Gestión de Productos</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#f0dde6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Productos</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => { setCreando((v) => !v); setCreateError(null); }}
              style={{ background: creando ? (dark ? "rgba(198,138,149,0.22)" : "rgba(198,138,149,0.14)") : (dark ? "rgba(198,138,149,0.14)" : "rgba(198,138,149,0.08)"), border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`, borderRadius: 12, padding: "9px 18px", color: dark ? "#e8b4bc" : "#C68A95", fontSize: 13, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 7 }}
            >
              <i className={`fa-solid ${creando ? "fa-xmark" : "fa-plus"}`} />
              {creando ? "Cancelar" : "Nuevo Producto"}
            </button>
            <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(91,126,100,0.10)", border: `1.5px solid ${dark ? "#3a2830" : "#c5dcc6"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#4A6B52", fontSize: 15, cursor: "pointer" }}>
              <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Formulario Nuevo Producto */}
        {creando && (
          <div style={{ background: cardBg, border: `1.5px solid #C68A95`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 30px rgba(198,138,149,0.18)", marginBottom: 28 }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-box-open" style={{ color: "#C68A95", fontSize: 16 }} />
              <span style={{ fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Nuevo Producto</span>
            </div>

            <div style={{ padding: "24px", display: "flex", gap: 24, flexWrap: "wrap" }}>

              {/* Columna imagen */}
              <div style={{ flexShrink: 0 }}>
                <label style={labelStyle}>Imagen</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: 140, height: 140, borderRadius: 14, border: `2px dashed ${imagePreview ? "#C68A95" : border}`, background: imagePreview ? "transparent" : inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative" }}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ textAlign: "center", color: textMuted }}>
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, display: "block", marginBottom: 6 }} />
                        <span style={{ fontSize: 11, ...MONO }}>Subir imagen</span>
                      </div>
                  }
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                {imagePreview && (
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ marginTop: 6, fontSize: 11, color: textMuted, background: "none", border: "none", cursor: "pointer", ...MONO }}>
                    <i className="fa-solid fa-trash" style={{ marginRight: 4 }} />Quitar imagen
                  </button>
                )}
              </div>

              {/* Columna campos */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Nombre del producto *</label>
                    <input type="text" placeholder="Ej: Sérum Vitamina C" value={nuevoForm.title} onChange={(e) => setNuevoForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Precio CLP</label>
                    <input type="number" min="0" placeholder="19990" value={nuevoForm.precio} onChange={(e) => setNuevoForm((f) => ({ ...f, precio: e.target.value }))} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Stock (unidades)</label>
                    <input type="number" min="0" value={nuevoForm.stock} onChange={(e) => setNuevoForm((f) => ({ ...f, stock: e.target.value }))} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <select value={nuevoForm.categoria} onChange={(e) => setNuevoForm((f) => ({ ...f, categoria: e.target.value }))} style={inputStyle}>
                      <option value="">Sin categoría</option>
                      <option value="Serums">Serums</option>
                      <option value="Cremas">Cremas</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Ojos & Pestañas">Ojos &amp; Pestañas</option>
                      <option value="Protección Solar">Protección Solar</option>
                      <option value="Hidratación">Hidratación</option>
                      <option value="Mascarillas">Mascarillas</option>
                      <option value="Cabello">Cabello</option>
                      <option value="Corporal">Corporal</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Badge</label>
                    <select value={nuevoForm.badge} onChange={(e) => setNuevoForm((f) => ({ ...f, badge: e.target.value }))} style={inputStyle}>
                      <option value="">Sin badge</option>
                      <option value="nuevo">Nuevo</option>
                      <option value="bestseller">Bestseller</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Descripción</label>
                    <textarea placeholder="Describe el producto..." value={nuevoForm.description} onChange={(e) => setNuevoForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
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
                    disabled={creatingProduct}
                    style={{ background: "linear-gradient(135deg, #C68A95, #8B5E6A)", border: "none", borderRadius: 10, padding: "10px 28px", color: "#fff", fontSize: 13, cursor: creatingProduct ? "wait" : "pointer", ...MONO, display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {creatingProduct
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Creando...</>
                      : <><i className="fa-solid fa-sparkles" /> Crear Producto</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buscador y filtros */}
        {!loading && productos.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: textMuted, fontSize: 13 }} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>
            <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              {(["todos", "stock", "agotado"] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setFiltroEstado(op)}
                  style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12, cursor: "pointer", ...MONO, border: `1px solid ${filtroEstado === op ? "#C68A95" : border}`, background: filtroEstado === op ? "rgba(198,138,149,0.12)" : inputBg, color: filtroEstado === op ? "#C68A95" : textMuted }}
                >
                  {op === "todos" ? "Todos" : op === "stock" ? "En stock" : "Agotados"}
                </button>
              ))}
            </div>
            {(busqueda || filtroCat || filtroEstado !== "todos") && (
              <button onClick={() => { setBusqueda(""); setFiltroCat(""); setFiltroEstado("todos"); }} style={{ fontSize: 11, color: textMuted, background: "none", border: "none", cursor: "pointer", ...MONO }}>
                <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />Limpiar
              </button>
            )}
          </div>
        )}

        {/* Lista de productos */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted, ...MONO }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, marginBottom: 12, display: "block" }} />
            Cargando productos...
          </div>
        ) : productos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted }}>
            No se encontraron productos.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {productosFiltrados.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, ...MONO, fontSize: 13 }}>
                <i className="fa-solid fa-filter" style={{ fontSize: 22, display: "block", marginBottom: 10 }} />
                Sin resultados para esa búsqueda.
              </div>
            )}
            {productosFiltrados.map((p) => {
              const f = form[p.id] ?? { stock: "0", precio: "", categoria: "", badge: "", title: p.title, description: p.description };
              const stock = Number(f.stock);
              const agotado = stock <= 0;
              const isEditing = editando === p.id;
              const isSaving = saving === p.id;
              const wasSaved = saved === p.id;
              const isPublished = p.status === "published";
              const isToggling = toggling === p.id;

              return (
                <div key={p.id} style={{ background: cardBg, border: `1.5px solid ${isPublished ? border : textMuted}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", opacity: isPublished ? 1 : 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>

                    <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(198,138,149,0.1)", border: `1px solid ${border}` }}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fa-solid fa-image" style={{ color: textMuted, fontSize: 20 }} />
                          </div>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: "normal" }}>{p.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: textMuted, ...MONO }}>
                        {f.categoria || "Sin categoría"} · {f.precio ? fmtPrecio(Number(f.precio)) : "Sin precio"}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, ...MONO, color: agotado ? "#e57373" : "#81c784", fontWeight: 700 }}>
                        <i className="fa-solid fa-circle" style={{ fontSize: 7, marginRight: 5 }} />
                        {agotado ? "Agotado" : `${stock} uds.`}
                      </span>
                      {wasSaved && (
                        <span style={{ fontSize: 11, color: "#81c784", ...MONO }}>
                          <i className="fa-solid fa-check" /> Guardado
                        </span>
                      )}
                      <button
                        onClick={() => toggleStatus(p.id, p.status)}
                        disabled={isToggling}
                        title={isPublished ? "Ocultar de la tienda" : "Publicar en la tienda"}
                        style={{ background: isPublished ? "transparent" : "rgba(154,124,134,0.12)", border: `1px solid ${isPublished ? border : textMuted}`, borderRadius: 8, padding: "6px 12px", color: isPublished ? textMuted : textMuted, fontSize: 12, cursor: isToggling ? "wait" : "pointer", ...MONO }}
                      >
                        {isToggling
                          ? <i className="fa-solid fa-spinner fa-spin" />
                          : isPublished
                            ? <><i className="fa-solid fa-eye-slash" style={{ marginRight: 5 }} />Ocultar</>
                            : <><i className="fa-solid fa-eye" style={{ marginRight: 5 }} />Publicar</>
                        }
                      </button>
                      <button
                        onClick={() => setEditando(isEditing ? null : p.id)}
                        style={{ background: isEditing ? "rgba(198,138,149,0.15)" : "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 14px", color: "#C68A95", fontSize: 12, cursor: "pointer", ...MONO }}
                      >
                        {isEditing ? "Cerrar" : <><i className="fa-solid fa-pen" style={{ marginRight: 5 }} />Editar</>}
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: "20px 24px", background: dark ? "rgba(0,0,0,0.15)" : "rgba(198,138,149,0.04)" }}>

                      {/* Cambiar imagen */}
                      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          onClick={() => editFileRefs.current[p.id]?.click()}
                          style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: `2px dashed ${editImagePreview[p.id] ? "#C68A95" : border}`, background: inputBg, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {editImagePreview[p.id]
                            ? <img src={editImagePreview[p.id]} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : p.thumbnail
                              ? <img src={p.thumbnail} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : <i className="fa-solid fa-image" style={{ color: textMuted, fontSize: 22 }} />
                          }
                        </div>
                        <div>
                          <button
                            onClick={() => editFileRefs.current[p.id]?.click()}
                            style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 14px", color: textMuted, fontSize: 12, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 6 }}
                          >
                            <i className="fa-solid fa-cloud-arrow-up" /> {editImagePreview[p.id] ? "Cambiar imagen" : "Subir nueva imagen"}
                          </button>
                          {editImagePreview[p.id] && (
                            <button onClick={() => { setEditImageFile((v) => { const n={...v}; delete n[p.id]; return n; }); setEditImagePreview((v) => { const n={...v}; delete n[p.id]; return n; }); }} style={{ marginTop: 4, fontSize: 11, color: "#e57373", background: "none", border: "none", cursor: "pointer", ...MONO }}>
                              <i className="fa-solid fa-xmark" style={{ marginRight: 3 }} />Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="file" accept="image/*"
                          ref={(el) => { editFileRefs.current[p.id] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setEditImageFile((prev) => ({ ...prev, [p.id]: file }));
                            setEditImagePreview((prev) => ({ ...prev, [p.id]: URL.createObjectURL(file) }));
                          }}
                          style={{ display: "none" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Stock (unidades)</label>
                          <input type="number" min="0" value={f.stock} onChange={(e) => updateField(p.id, "stock", e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Precio CLP</label>
                          <input type="number" min="0" value={f.precio} onChange={(e) => updateField(p.id, "precio", e.target.value)} placeholder="19990" style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Categoría</label>
                          <select value={f.categoria} onChange={(e) => updateField(p.id, "categoria", e.target.value)} style={inputStyle}>
                            <option value="">Sin categoría</option>
                            <option value="Serums">Serums</option>
                            <option value="Cremas">Cremas</option>
                            <option value="Limpieza">Limpieza</option>
                            <option value="Ojos & Pestañas">Ojos &amp; Pestañas</option>
                            <option value="Protección Solar">Protección Solar</option>
                            <option value="Hidratación">Hidratación</option>
                            <option value="Mascarillas">Mascarillas</option>
                            <option value="Cabello">Cabello</option>
                            <option value="Corporal">Corporal</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Badge</label>
                          <select value={f.badge} onChange={(e) => updateField(p.id, "badge", e.target.value)} style={inputStyle}>
                            <option value="">Sin badge</option>
                            <option value="nuevo">Nuevo</option>
                            <option value="bestseller">Bestseller</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Nombre del producto</label>
                          <input type="text" value={f.title} onChange={(e) => updateField(p.id, "title", e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Descripción</label>
                          <textarea value={f.description} onChange={(e) => updateField(p.id, "description", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button
                          onClick={() => eliminar(p.id, p.title)}
                          disabled={deleting === p.id}
                          style={{ background: "transparent", border: "1px solid #e57373", borderRadius: 10, padding: "9px 18px", color: "#e57373", fontSize: 12, cursor: deleting === p.id ? "wait" : "pointer", ...MONO, display: "flex", alignItems: "center", gap: 7 }}
                        >
                          {deleting === p.id ? <><i className="fa-solid fa-spinner fa-spin" /> Eliminando...</> : <><i className="fa-solid fa-trash" /> Eliminar producto</>}
                        </button>
                        <button
                          onClick={() => guardar(p.id)}
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
