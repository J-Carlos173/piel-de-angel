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

export default function PedidosClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [imagenes, setImagenes] = useState<{ file: File; preview: string }[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "#ffffff";
  const bubbleMe = dark ? "linear-gradient(135deg, #C68A95, #8B5E6A)" : "linear-gradient(135deg, #C68A95, #8B5E6A)";
  const bubbleClaude = dark ? "rgba(255,255,255,0.06)" : "#F5EEEC";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  async function cargar() {
    try {
      const res = await fetch("/api/admin/pedidos");
      const data = await res.json();
      setPedidos((data.pedidos ?? []).slice().reverse());
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pedidos.length]);

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
      setPedidos((prev) => [...prev, data.pedido]);
      setTexto("");
      setImagenes([]);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: bg, transition: "background 0.3s", fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
        padding: "18px 24px",
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #ecddd9",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 8, padding: "7px 10px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 13, cursor: "pointer", ...MONO }}>
            <i className="fa-solid fa-arrow-left" />
          </button>
          <div>
            <h1 style={{ margin: 0, color: textMain, fontSize: 18, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Chat con Claude
            </h1>
            <p style={{ margin: 0, color: textMuted, fontSize: 11, ...MONO }}>Reviso cada 2 min · nada se sube sin que Carlos lo apruebe</p>
          </div>
        </div>
        <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer", flexShrink: 0 }}>
          <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
        </button>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, ...MONO }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 20, marginBottom: 8, display: "block" }} />
              Cargando...
            </div>
          ) : pedidos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: textMuted, fontSize: 13, ...MONO }}>
              <i className="fa-solid fa-comment-dots" style={{ fontSize: 26, marginBottom: 10, display: "block", opacity: 0.5 }} />
              Escribe tu primer pedido abajo.
            </div>
          ) : (
            pedidos.map((p) => {
              const meta = ESTADO_META[p.estado];
              return (
                <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Burbuja: pedido (derecha) */}
                  <div style={{ alignSelf: "flex-end", maxWidth: "82%" }}>
                    <div style={{ background: bubbleMe, color: "white", borderRadius: "18px 18px 4px 18px", padding: "12px 16px", boxShadow: "0 4px 16px rgba(198,138,149,0.25)" }}>
                      {p.imagenes.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: p.texto ? 8 : 0 }}>
                          {p.imagenes.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="adjunto" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.4)" }} />
                            </a>
                          ))}
                        </div>
                      )}
                      {p.texto && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.texto}</p>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4, paddingRight: 4 }}>
                      <span style={{ fontSize: 10.5, color: meta.color, ...MONO, display: "flex", alignItems: "center", gap: 4 }}>
                        <i className={`fa-solid ${meta.icon}`} /> {meta.label}
                      </span>
                      <span style={{ fontSize: 10.5, color: textMuted, ...MONO }}>{fmtHora(p.created_at)}</span>
                    </div>
                  </div>

                  {/* Burbuja: respuesta de Claude (izquierda) */}
                  {p.respuesta && (
                    <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
                      <div style={{ background: bubbleClaude, color: textMain, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", border: `1px solid ${border}` }}>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.respuesta}</p>
                      </div>
                      <div style={{ fontSize: 10.5, color: textMuted, marginTop: 4, paddingLeft: 4, ...MONO }}>
                        Claude {p.completed_at && `· ${fmtHora(p.completed_at)}`}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ borderTop: `1.5px solid ${border}`, background: cardBg, padding: "14px 16px", flexShrink: 0 }}>
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
    </div>
  );
}
