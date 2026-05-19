"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Role = "user" | "assistant";
type Msg  = { role: Role; text: string; tools?: string[] };

const TOOL_LABELS: Record<string, string> = {
  ver_resenas:        "Leyendo reseñas",
  aprobar_resena:     "Aprobando reseña",
  eliminar_resena:    "Eliminando reseña",
  ocultar_resena:     "Ocultando reseña",
  ver_servicios:      "Revisando servicios",
  crear_servicio:     "Creando servicio",
  actualizar_servicio:"Actualizando servicio",
  eliminar_servicio:  "Eliminando servicio",
  ver_estadisticas:   "Revisando estadísticas",
  ver_agenda:         "Revisando agenda",
  ver_productos:      "Revisando productos",
  actualizar_producto:"Actualizando producto",
};

const SUGERENCIAS = [
  "¿Cuántas visitas tuve hoy?",
  "¿Hay reseñas pendientes?",
  "Muéstrame los servicios publicados",
  "¿Qué citas hay próximamente?",
];

export default function AiChatClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [msgs, setMsgs]     = useState<Msg[]>([]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const bg      = dark ? "#160f13" : "#f5eeec";
  const cardBg  = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border  = dark ? "#3a2830" : "#ecddd9";
  const textMain= dark ? "#f0dde6" : "#2e1e24";
  const textMuted=dark ? "#9a7c86" : "#9a8486";
  const inputBg = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: "user", text: trimmed };
    const next = [...msgs, userMsg];
    setMsgs(next);
    setInput("");
    setLoading(true);

    try {
      const history = next.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res  = await fetch("/api/admin/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
      });
      const data = await res.json();

      setMsgs((prev) => [
        ...prev,
        { role: "assistant", text: data.reply ?? "Ocurrió un error.", tools: data.toolsUsed ?? [] },
      ]);
    } catch {
      setMsgs((prev) => [...prev, { role: "assistant", text: "No pude conectarme. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const isEmpty = msgs.length === 0;

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
        padding: "28px 32px 24px", position: "relative", overflow: "hidden", flexShrink: 0,
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #ecddd9",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #D8A7B1, #C68A95, #D8A7B1, transparent)" }} />
        <svg aria-hidden style={{ position: "absolute", right: 0, top: -8, opacity: dark ? 0.07 : 0.08, width: 130, pointerEvents: "none" }} viewBox="0 0 220 320">
          <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#C68A95"/>
          <path d="M110,10 C105,80 108,175 108,268" stroke="#8B6F6F" strokeWidth="2" fill="none" opacity={0.4}/>
        </svg>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Asistente IA</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#f0dde6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Hola, Teresita <span style={{ fontSize: 20 }}>✨</span>
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: textMuted, ...MONO }}>Pídeme lo que necesites — puedo gestionar reseñas, servicios, ver tu agenda y más.</p>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "24px 16px 0", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

        {/* Estado vacío */}
        {isEmpty && (
          <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #C68A95, #8B6F6F)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 28px rgba(198,138,149,0.35)" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 26, color: "#fff" }} />
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 15, color: textMuted, ...MONO }}>¿En qué te ayudo hoy?</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {SUGERENCIAS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  style={{ padding: "8px 16px", borderRadius: 20, fontSize: 12, cursor: "pointer", ...MONO, border: `1.5px solid ${border}`, background: inputBg, color: textMuted, transition: "border-color 0.2s, color 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C68A95"; e.currentTarget.style.color = "#C68A95"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes */}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>

            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #C68A95, #8B6F6F)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 13, color: "#fff" }} />
              </div>
            )}

            <div style={{ maxWidth: "75%" }}>
              {/* Pills de herramientas usadas */}
              {m.role === "assistant" && m.tools && m.tools.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {[...new Set(m.tools)].map((t) => (
                    <span key={t} style={{ fontSize: 10, ...MONO, padding: "3px 8px", borderRadius: 10, background: dark ? "rgba(198,138,149,0.15)" : "rgba(198,138,149,0.1)", color: "#C68A95", border: "1px solid rgba(198,138,149,0.25)" }}>
                      <i className="fa-solid fa-check" style={{ marginRight: 4, fontSize: 8 }} />
                      {TOOL_LABELS[t] ?? t}
                    </span>
                  ))}
                </div>
              )}

              <div style={{
                background: m.role === "user"
                  ? "linear-gradient(135deg, #C68A95, #8B6F6F)"
                  : cardBg,
                border: m.role === "user" ? "none" : `1.5px solid ${border}`,
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "12px 16px",
                boxShadow: m.role === "user" ? "0 4px 16px rgba(198,138,149,0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <p style={{ margin: 0, fontSize: 14, color: m.role === "user" ? "#fff" : textMain, lineHeight: 1.65, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
                  {m.text}
                </p>
              </div>
            </div>

            {m.role === "user" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: dark ? "rgba(255,255,255,0.12)" : "rgba(198,138,149,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-user" style={{ fontSize: 13, color: "#C68A95" }} />
              </div>
            )}
          </div>
        ))}

        {/* Indicador de carga */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 10, alignItems: "flex-end" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #C68A95, #8B6F6F)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 13, color: "#fff" }} />
            </div>
            <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: "18px 18px 18px 4px", padding: "14px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#C68A95", opacity: 0.5, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: 8 }} />
      </div>

      {/* Input fijo abajo */}
      <div style={{ flexShrink: 0, background: dark ? "#1a1218" : "#fff", borderTop: `1.5px solid ${border}`, padding: "16px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escríbeme lo que necesitas… (Enter para enviar)"
            rows={1}
            disabled={loading}
            style={{ flex: 1, background: inputBg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "12px 16px", color: textMain, fontSize: 14, fontFamily: "Georgia, serif", outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", opacity: loading ? 0.6 : 1 }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{ width: 44, height: 44, borderRadius: "50%", background: input.trim() && !loading ? "linear-gradient(135deg, #C68A95, #8B6F6F)" : (dark ? "rgba(255,255,255,0.08)" : "rgba(198,138,149,0.15)"), border: "none", color: input.trim() && !loading ? "#fff" : "#C68A95", fontSize: 16, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", boxShadow: input.trim() && !loading ? "0 4px 14px rgba(198,138,149,0.4)" : "none" }}
          >
            <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
          </button>
        </div>
        <p style={{ maxWidth: 800, margin: "8px auto 0", fontSize: 10, color: textMuted, ...MONO, textAlign: "center" }}>
          Shift+Enter para nueva línea · Powered by Claude
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
