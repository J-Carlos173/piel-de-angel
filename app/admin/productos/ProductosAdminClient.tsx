"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Producto = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  metadata: {
    stock?: number;
    categoria?: string;
    badge?: string;
  } | null;
  variants?: { prices?: { currency_code: string; amount: number }[] }[];
};

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

  const bg      = dark ? "#160f13" : "#f5eeec";
  const cardBg  = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border  = dark ? "#3a2830" : "#ecddd9";
  const textMain= dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  useEffect(() => {
    fetch("/api/admin/productos")
      .then((r) => r.json())
      .then((data) => {
        const prods = data.products ?? [];
        setProductos(prods);
        const initialForm: typeof form = {};
        prods.forEach((p: Producto) => {
          const clpPrice = p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "clp");
          initialForm[p.id] = {
            stock: String(p.metadata?.stock ?? 0),
            precio: clpPrice ? String(clpPrice.amount) : "",
            categoria: p.metadata?.categoria ?? "",
            badge: p.metadata?.badge ?? "",
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
    await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        title: f.title,
        description: f.description,
        stock: Number(f.stock),
        precio: f.precio ? Number(f.precio) : undefined,
        categoria: f.categoria,
        badge: f.badge,
      }),
    });
    setSaving(null);
    setSaved(id);
    setEditando(null);
    setTimeout(() => setSaved(null), 2500);

    // Refrescar el producto en la lista local
    setProductos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              title: f.title,
              description: f.description,
              metadata: { ...p.metadata, stock: Number(f.stock), categoria: f.categoria, badge: f.badge },
            }
          : p
      )
    );
  }

  function updateField(id: string, field: string, value: string) {
    setForm((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 10,
    padding: "9px 12px",
    color: textMain,
    fontSize: 13,
    fontFamily: "Montserrat, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: textMuted,
    fontFamily: "Montserrat, sans-serif",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(145deg, #5C3D47 0%, #8B5E6A 30%, #C68A95 68%, #E2B4BC 100%)", padding: "32px 32px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }} />
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "5px 12px", color: "#fff", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Gestión de Productos</p>
            <h1 style={{ margin: "6px 0 2px", color: "#fff", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Productos</h1>
          </div>
          <button onClick={toggle} style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.32)", borderRadius: 12, padding: "9px 13px", color: "#fff", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px 60px" }}>

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
            {productos.map((p) => {
              const f = form[p.id] ?? { stock: "0", precio: "", categoria: "", badge: "", title: p.title, description: p.description };
              const stock = Number(f.stock);
              const agotado = stock <= 0;
              const isEditing = editando === p.id;
              const isSaving = saving === p.id;
              const wasSaved = saved === p.id;

              return (
                <div key={p.id} style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                  {/* Fila principal */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>

                    {/* Imagen */}
                    <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(198,138,149,0.1)", border: `1px solid ${border}` }}>
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fa-solid fa-image" style={{ color: textMuted, fontSize: 20 }} />
                          </div>
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: "normal" }}>{p.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: textMuted, ...MONO }}>
                        {f.categoria || "Sin categoría"} · {f.precio ? fmtPrecio(Number(f.precio)) : "Sin precio"}
                      </p>
                    </div>

                    {/* Stock badge */}
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
                        onClick={() => setEditando(isEditing ? null : p.id)}
                        style={{ background: isEditing ? "rgba(198,138,149,0.15)" : "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 14px", color: "#C68A95", fontSize: 12, cursor: "pointer", ...MONO }}
                      >
                        {isEditing ? "Cerrar" : <><i className="fa-solid fa-pen" style={{ marginRight: 5 }} />Editar</>}
                      </button>
                    </div>
                  </div>

                  {/* Panel de edición */}
                  {isEditing && (
                    <div style={{ borderTop: `1px solid ${border}`, padding: "20px 24px", background: dark ? "rgba(0,0,0,0.15)" : "rgba(198,138,149,0.04)" }}>
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
                          <input type="text" value={f.categoria} onChange={(e) => updateField(p.id, "categoria", e.target.value)} placeholder="Serums" style={inputStyle} />
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

                      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
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
