"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";
import type { PromoCode } from "@/lib/promos-db";

function fmtPrecio(n: number) {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function PromosClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ code: "", discount: "", max_uses: "1" });

  const bg        = dark ? "#160f13" : "#f5eeec";
  const cardBg    = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border    = dark ? "#3a2830" : "#ecddd9";
  const textMain  = dark ? "#f0dde6" : "#2e1e24";
  const textMuted = dark ? "#9a7c86" : "#9a8486";
  const inputBg   = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };
  const inputStyle: React.CSSProperties = { width: "100%", background: inputBg, border: `1px solid ${border}`, borderRadius: 10, padding: "9px 12px", color: textMain, fontSize: 13, ...MONO, outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: textMuted, ...MONO, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, display: "block" };

  useEffect(() => {
    fetch("/api/admin/promos")
      .then((r) => r.json())
      .then((d) => { setPromos(d.promos ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.discount) { setError("Código y descuento son obligatorios"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.code, discount: Number(form.discount), max_uses: Number(form.max_uses) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Error al crear"); setSaving(false); return; }
    setPromos((prev) => [data.promo, ...prev]);
    setForm({ code: "", discount: "", max_uses: "1" });
    setSaving(false);
  }

  async function toggleActivo(id: number, active: boolean) {
    await fetch("/api/admin/promos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    setPromos((prev) => prev.map((p) => p.id === id ? { ...p, active } : p));
  }

  async function eliminar(id: number, code: string) {
    if (!confirm(`¿Eliminar el código "${code}"?`)) return;
    await fetch("/api/admin/promos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPromos((prev) => prev.filter((p) => p.id !== id));
  }

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
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(91,126,100,0.10)", border: `1px solid ${dark ? "#3a2830" : "#c5dcc6"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#4A6B52", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#7A9E8A", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Descuentos y Promociones</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#f0dde6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Códigos de Descuento</h1>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(91,126,100,0.10)", border: `1.5px solid ${dark ? "#3a2830" : "#c5dcc6"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#4A6B52", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Formulario nuevo código */}
        <div style={{ background: cardBg, border: `1.5px solid #C68A95`, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 30px rgba(198,138,149,0.18)", marginBottom: 28 }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <i className="fa-solid fa-plus-circle" style={{ color: "#C68A95", fontSize: 16 }} />
            <span style={{ fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Nuevo código de descuento</span>
          </div>
          <form onSubmit={crear} style={{ padding: "22px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Código *</label>
                <input
                  type="text"
                  placeholder="MESDELAMAMA"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Descuento CLP *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="5000"
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Máximo de canjes</label>
                <input
                  type="number"
                  min="1"
                  value={form.max_uses}
                  onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
            {error && <p style={{ fontSize: 12, color: "#e57373", ...MONO, marginBottom: 12 }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5 }} />{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={saving} style={{ background: "linear-gradient(135deg, #C68A95, #8B5E6A)", border: "none", borderRadius: 10, padding: "10px 28px", color: "#fff", fontSize: 13, cursor: saving ? "wait" : "pointer", ...MONO, display: "flex", alignItems: "center", gap: 8 }}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Creando...</> : <><i className="fa-solid fa-sparkles" /> Crear código</>}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de códigos */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, ...MONO }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 10, display: "block" }} />Cargando...
          </div>
        ) : promos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, ...MONO, fontSize: 13 }}>
            <i className="fa-solid fa-tag" style={{ fontSize: 30, display: "block", marginBottom: 10, opacity: 0.3 }} />
            Aún no hay códigos creados.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {promos.map((p) => {
              const agotado = p.used_count >= p.max_uses;
              return (
                <div key={p.id} style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", opacity: p.active ? 1 : 0.55 }}>
                  {/* Código */}
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 18, color: "#C68A95", ...MONO, fontWeight: 700, letterSpacing: "0.04em" }}>{p.code}</p>
                    <p style={{ margin: 0, fontSize: 12, color: textMuted, ...MONO }}>
                      {new Date(p.created_at).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  {/* Descuento */}
                  <div style={{ textAlign: "center", minWidth: 90 }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: textMain, ...MONO }}>{fmtPrecio(p.discount)}</p>
                    <p style={{ margin: 0, fontSize: 10, color: textMuted, ...MONO, textTransform: "uppercase" }}>descuento</p>
                  </div>
                  {/* Canjes */}
                  <div style={{ textAlign: "center", minWidth: 80 }}>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: agotado ? "#e57373" : textMain, ...MONO }}>{p.used_count}/{p.max_uses}</p>
                    <p style={{ margin: 0, fontSize: 10, color: textMuted, ...MONO, textTransform: "uppercase" }}>canjes</p>
                  </div>
                  {/* Estado */}
                  <span style={{ fontSize: 10, ...MONO, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 20, background: agotado ? "rgba(229,115,115,0.1)" : p.active ? "rgba(102,187,106,0.12)" : "rgba(154,124,134,0.1)", color: agotado ? "#e57373" : p.active ? "#66bb6a" : textMuted, border: `1px solid ${agotado ? "rgba(229,115,115,0.3)" : p.active ? "rgba(102,187,106,0.3)" : border}` }}>
                    {agotado ? "Agotado" : p.active ? "Activo" : "Pausado"}
                  </span>
                  {/* Acciones */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {!agotado && (
                      <button
                        onClick={() => toggleActivo(p.id, !p.active)}
                        title={p.active ? "Pausar" : "Activar"}
                        style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 12px", color: textMuted, fontSize: 12, cursor: "pointer", ...MONO }}
                      >
                        <i className={`fa-solid ${p.active ? "fa-pause" : "fa-play"}`} />
                      </button>
                    )}
                    <button
                      onClick={() => eliminar(p.id, p.code)}
                      style={{ background: "transparent", border: "1px solid #e57373", borderRadius: 8, padding: "6px 12px", color: "#e57373", fontSize: 12, cursor: "pointer", ...MONO }}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
