"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Pedido = {
  id: number;
  texto: string;
  imagenes: string[];
  estado: "pendiente" | "en_proceso" | "hecho" | "error";
  respuesta: string | null;
  created_at: string;
  completed_at: string | null;
};

const ESTADO_META: Record<Pedido["estado"], { label: string; color: string; icon: string }> = {
  pendiente:  { label: "Enviado",    color: "#B08A00", icon: "fa-check" },
  en_proceso: { label: "Trabajando en esto...", color: "#3A6FB0", icon: "fa-spinner fa-spin" },
  hecho:      { label: "Listo",      color: "#4CAF85", icon: "fa-check-double" },
  error:      { label: "Con error",  color: "#C0524F", icon: "fa-triangle-exclamation" },
};

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

function fmtSeccion(iso: string) {
  const fecha = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const mismoDia = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (mismoDia(fecha, hoy)) return "Hoy";
  if (mismoDia(fecha, ayer)) return "Ayer";
  return fecha.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: hoy.getFullYear() !== fecha.getFullYear() ? "numeric" : undefined });
}

function titulo(p: Pedido) {
  const t = p.texto?.trim();
  if (t) return t.length > 42 ? t.slice(0, 42) + "…" : t;
  return p.imagenes.length > 0 ? "(imagen adjunta)" : "(sin texto)";
}

export default function PedidosClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [imagenes, setImagenes] = useState<{ file: File; preview: string }[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg        = dark ? "#160f13" : "#f5eeec";
  const sidebarBg = dark ? "rgba(30,21,26,0.97)" : "#ffffff";
  const cardBg    = dark ? "rgba(42,28,34,0.95)" : "#ffffff";
  const bubbleMe      = "linear-gradient(135deg, #C68A95, #8B5E6A)";
  const bubbleClaude  = dark ? "rgba(255,255,255,0.06)" : "#F5EEEC";
  const border    = dark ? "#3a2830" : "#ecddd9";
  const textMain  = dark ? "#f0dde6" : "#2e1e24";
  const textMuted = dark ? "#9a7c86" : "#9a8486";
  const inputBg   = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const activeBg  = dark ? "rgba(198,138,149,0.14)" : "rgba(198,138,149,0.08)";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  async function cargar() {
    try {
      const res = await fetch("/api/admin/pedidos");
      const data = await res.json();
      setPedidos(data.pedidos ?? []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 8000);
    return () => clearInterval(interval);
  }, []);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImagenes((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function quitarImagen(idx: number) {
    setImagenes((prev) => prev.filter((_, i) => i !== idx));
  }

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const img of imagenes) {
        const fd = new FormData();
        fd.append("file", img.file);
        fd.append("folder", "pedidos");
        const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (upRes.ok) {
          const upData = await upRes.json();
          urls.push(upData.url);
        }
      }

      const res = await fetch("/api/admin/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto.trim(), imagenes: urls }),
      });
      const data = await res.json();
      if (!res.ok || !data.pedido) { setError(data.error || "Error al enviar. Intenta de nuevo."); return; }
      setPedidos((prev) => [data.pedido, ...prev]);
      setSeleccionado(data.pedido.id);
      setTexto("");
      setImagenes([]);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Borrar esta conversación? También se borra el archivo en tu PC.")) return;
    setEliminando(id);
    try {
      await fetch("/api/admin/pedidos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      if (seleccionado === id) setSeleccionado(null);
    } catch {} finally {
      setEliminando(null);
    }
  }

  const activo = seleccionado ? pedidos.find((p) => p.id === seleccionado) ?? null : null;

  return (
    <div style={{ height: "100vh", display: "flex", background: bg, fontFamily: "Georgia, serif" }}>

      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, borderRight: `1.5px solid ${border}`, background: sidebarBg, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1.5px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${border}`, borderRadius: 8, padding: "7px 9px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer" }}>
            <i className="fa-solid fa-arrow-left" />
          </button>
          <h1 style={{ margin: 0, flex: 1, color: textMain, fontSize: 16, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Asistente IA</h1>
          <button onClick={toggle} style={{ background: "none", border: "none", color: textMuted, fontSize: 13, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>

        <button
          onClick={() => setSeleccionado(null)}
          style={{
            margin: 12, padding: "11px 14px", borderRadius: 12, border: "none",
            background: !seleccionado ? "linear-gradient(135deg, #C68A95, #8B5E6A)" : (dark ? "rgba(255,255,255,0.06)" : "#F5EEEC"),
            color: !seleccionado ? "white" : textMain,
            fontSize: 13, ...MONO, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <i className="fa-solid fa-plus" /> Nueva conversación
        </button>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: textMuted, fontSize: 12, ...MONO, marginTop: 20 }}>Cargando...</p>
          ) : pedidos.length === 0 ? (
            <p style={{ textAlign: "center", color: textMuted, fontSize: 12, ...MONO, marginTop: 20, padding: "0 16px" }}>Sin conversaciones todavía.</p>
          ) : (
            pedidos.map((p, idx) => {
              const meta = ESTADO_META[p.estado];
              const seccion = fmtSeccion(p.created_at);
              const seccionAnterior = idx > 0 ? fmtSeccion(pedidos[idx - 1].created_at) : null;
              const isActive = seleccionado === p.id;
              return (
                <div key={p.id}>
                  {seccion !== seccionAnterior && (
                    <p style={{ margin: "14px 8px 6px", fontSize: 10, color: textMuted, ...MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>{seccion}</p>
                  )}
                  <div
                    onClick={() => setSeleccionado(p.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 10px",
                      borderRadius: 10, cursor: "pointer", marginBottom: 3,
                      background: isActive ? activeBg : "transparent",
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} title={meta.label} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12.5, color: textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titulo(p)}</p>
                      <p style={{ margin: 0, fontSize: 10, color: textMuted, ...MONO }}>{fmtHora(p.created_at)} · {meta.label}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminar(p.id); }}
                      disabled={eliminando === p.id}
                      title="Borrar conversación"
                      style={{ background: "none", border: "none", color: textMuted, fontSize: 12, cursor: "pointer", padding: 4, flexShrink: 0, opacity: 0.6 }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                    >
                      <i className={`fa-solid ${eliminando === p.id ? "fa-spinner fa-spin" : "fa-trash"}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Panel principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {activo ? (
          <>
            <div style={{ padding: "16px 24px", borderBottom: `1.5px solid ${border}`, flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: textMuted, ...MONO }}>Pedido #{activo.id} · {fmtHora(activo.created_at)}</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ alignSelf: "flex-end", maxWidth: "82%" }}>
                  <div style={{ background: bubbleMe, color: "white", borderRadius: "18px 18px 4px 18px", padding: "12px 16px", boxShadow: "0 4px 16px rgba(198,138,149,0.25)" }}>
                    {activo.imagenes.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: activo.texto ? 8 : 0 }}>
                        {activo.imagenes.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="adjunto" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.4)" }} />
                          </a>
                        ))}
                      </div>
                    )}
                    {activo.texto && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{activo.texto}</p>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4, paddingRight: 4 }}>
                    <span style={{ fontSize: 10.5, color: ESTADO_META[activo.estado].color, ...MONO, display: "flex", alignItems: "center", gap: 4 }}>
                      <i className={`fa-solid ${ESTADO_META[activo.estado].icon}`} /> {ESTADO_META[activo.estado].label}
                    </span>
                  </div>
                </div>

                {activo.respuesta && (
                  <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
                    <div style={{ background: bubbleClaude, color: textMain, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", border: `1px solid ${border}` }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{activo.respuesta}</p>
                    </div>
                    <div style={{ fontSize: 10.5, color: textMuted, marginTop: 4, paddingLeft: 4, ...MONO }}>
                      Claude {activo.completed_at && `· ${fmtHora(activo.completed_at)}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: `1.5px solid ${border}`, textAlign: "center", flexShrink: 0 }}>
              <button onClick={() => setSeleccionado(null)} style={{ background: "none", border: `1px solid ${border}`, borderRadius: 100, padding: "9px 20px", color: textMuted, fontSize: 12, ...MONO, cursor: "pointer" }}>
                <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />Nueva conversación
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <div style={{ textAlign: "center", color: textMuted, maxWidth: 360 }}>
                <i className="fa-solid fa-comment-dots" style={{ fontSize: 30, marginBottom: 12, display: "block", opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: 14, fontFamily: "'Cormorant Garamond', Georgia, serif", color: textMain }}>Nueva conversación</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, ...MONO }}>Escribe tu pedido abajo. Claude lo revisa y responde acá mismo.</p>
              </div>
            </div>
            <div style={{ borderTop: `1.5px solid ${border}`, background: cardBg, padding: "16px 24px", flexShrink: 0 }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                {imagenes.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {imagenes.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.preview} alt="preview" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: `1px solid ${border}` }} />
                        <button onClick={() => quitarImagen(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#C0524F", color: "white", border: "none", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {error && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#e57373", ...MONO }}><i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5 }} />{error}</p>}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ flexShrink: 0, width: 42, height: 42, borderRadius: "50%", background: inputBg, border: `1px solid ${border}`, color: textMuted, fontSize: 15, cursor: "pointer" }}
                    title="Adjuntar imagen"
                  >
                    <i className="fa-solid fa-paperclip" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
                  <textarea
                    placeholder="Escribe tu pedido..."
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                    rows={1}
                    autoFocus
                    style={{ flex: 1, background: inputBg, border: `1px solid ${border}`, borderRadius: 20, padding: "11px 16px", color: textMain, fontSize: 14, fontFamily: "Georgia, serif", outline: "none", resize: "none", maxHeight: 120 }}
                  />
                  <button
                    onClick={enviar}
                    disabled={enviando || !texto.trim()}
                    style={{ flexShrink: 0, width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #C68A95, #8B5E6A)", border: "none", color: "white", fontSize: 15, cursor: enviando ? "wait" : "pointer", opacity: !texto.trim() ? 0.5 : 1 }}
                  >
                    <i className={`fa-solid ${enviando ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
