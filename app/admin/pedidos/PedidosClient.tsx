"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Pedido = {
  id: number;
  hilo_id: number | null;
  texto: string;
  imagenes: string[];
  estado: "pendiente" | "en_proceso" | "hecho" | "error";
  respuesta: string | null;
  created_at: string;
  completed_at: string | null;
};

type Hilo = {
  id: number;
  mensajes: Pedido[];
};

const ESTADO_META: Record<Pedido["estado"], { label: string; color: string; icon: string }> = {
  pendiente:  { label: "Enviado",    color: "#B08A00", icon: "fa-check" },
  en_proceso: { label: "Trabajando en esto...", color: "#3A6FB0", icon: "fa-spinner fa-spin" },
  hecho:      { label: "Listo",      color: "#4CAF85", icon: "fa-check-double" },
  error:      { label: "Con error",  color: "#C0524F", icon: "fa-triangle-exclamation" },
};

const MENSAJES_TRABAJO = [
  "Revisando tu pedido...",
  "Estamos trabajando en esto...",
  "Esto puede tomar unos minutos...",
  "Ajustando los detalles...",
  "Dejando todo listo...",
];

const SEGUNDOS_DEPLOY = 30;
const PIN_CORRECTO = "159632";
const PIN_STORAGE_KEY = "pieldeangel_pedidos_pin_ok";

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

function agruparHilos(pedidos: Pedido[]): Hilo[] {
  const grupos = new Map<number, Pedido[]>();
  for (const p of pedidos) {
    const hiloId = p.hilo_id ?? p.id;
    if (!grupos.has(hiloId)) grupos.set(hiloId, []);
    grupos.get(hiloId)!.push(p);
  }
  const hilos: Hilo[] = [];
  for (const [id, mensajes] of grupos) {
    mensajes.sort((a, b) => a.id - b.id);
    hilos.push({ id, mensajes });
  }
  hilos.sort((a, b) => {
    const ultA = a.mensajes[a.mensajes.length - 1];
    const ultB = b.mensajes[b.mensajes.length - 1];
    return new Date(ultB.created_at).getTime() - new Date(ultA.created_at).getTime();
  });
  return hilos;
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const [pinListo, setPinListo] = useState(false);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(PIN_STORAGE_KEY) === "1") setDesbloqueado(true);
    } catch {}
    setPinListo(true);
  }, []);

  function verificarPin(e: React.FormEvent) {
    e.preventDefault();
    if (pinIngresado === PIN_CORRECTO) {
      setDesbloqueado(true);
      setPinError(false);
      try { localStorage.setItem(PIN_STORAGE_KEY, "1"); } catch {}
    } else {
      setPinError(true);
      setPinIngresado("");
    }
  }

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

  const hilos = agruparHilos(pedidos);
  const hiloActivo = seleccionado ? hilos.find((h) => h.id === seleccionado) ?? null : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [hiloActivo?.mensajes.length]);

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
        body: JSON.stringify({ texto: texto.trim(), imagenes: urls, hilo_id: seleccionado ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.pedido) { setError(data.error || "Error al enviar. Intenta de nuevo."); return; }
      setPedidos((prev) => [...prev, data.pedido]);
      if (!seleccionado) setSeleccionado(data.pedido.id);
      setTexto("");
      setImagenes([]);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function eliminar(hiloId: number) {
    if (!confirm("¿Borrar esta conversación completa? También se borran los archivos en tu PC.")) return;
    setEliminando(hiloId);
    try {
      await fetch("/api/admin/pedidos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: hiloId }),
      });
      setPedidos((prev) => prev.filter((p) => (p.hilo_id ?? p.id) !== hiloId));
      if (seleccionado === hiloId) setSeleccionado(null);
    } catch {} finally {
      setEliminando(null);
    }
  }

  function renderMensaje(p: Pedido) {
    return (
      <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
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
            <span style={{ fontSize: 10.5, color: ESTADO_META[p.estado].color, ...MONO, display: "flex", alignItems: "center", gap: 4 }}>
              <i className={`fa-solid ${ESTADO_META[p.estado].icon}`} /> {ESTADO_META[p.estado].label}
            </span>
          </div>
        </div>

        {p.estado === "error" && p.respuesta ? (
          <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
            <div style={{ background: "rgba(192,82,79,0.08)", color: textMain, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", border: "1px solid rgba(192,82,79,0.3)" }}>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.respuesta}</p>
            </div>
          </div>
        ) : !p.respuesta ? (
          <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
            <div style={{ background: bubbleClaude, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ color: "#C68A95" }} />
              <span style={{ fontSize: 13, color: textMuted, ...MONO }}>{MENSAJES_TRABAJO[Math.floor(ahora / 3500) % MENSAJES_TRABAJO.length]}</span>
            </div>
          </div>
        ) : (() => {
          const transcurridos = p.completed_at ? (ahora - new Date(p.completed_at).getTime()) / 1000 : SEGUNDOS_DEPLOY;
          if (transcurridos < SEGUNDOS_DEPLOY) {
            const restantes = Math.max(0, Math.ceil(SEGUNDOS_DEPLOY - transcurridos));
            return (
              <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
                <div style={{ background: bubbleClaude, borderRadius: "18px 18px 18px 4px", padding: "14px 18px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <i className="fa-solid fa-cloud-arrow-up fa-fade" style={{ color: "#C68A95" }} />
                  <span style={{ fontSize: 13, color: textMuted, ...MONO }}>El cambio se está subiendo a producción... ({restantes}s)</span>
                </div>
              </div>
            );
          }
          return (
            <div style={{ alignSelf: "flex-start", maxWidth: "82%" }}>
              <div style={{ background: bubbleClaude, color: textMain, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", border: `1px solid ${border}` }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{p.respuesta}</p>
              </div>
              <div style={{ fontSize: 10.5, color: textMuted, marginTop: 4, paddingLeft: 4, ...MONO }}>
                Claude {p.completed_at && `· ${fmtHora(p.completed_at)}`}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  const composeBox = (
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
            placeholder={seleccionado ? "Escribe para seguir esta conversación..." : "Escribe tu pedido..."}
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
  );

  if (!pinListo) return null;

  if (!desbloqueado) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, fontFamily: "Georgia, serif", padding: 24 }}>
        <div style={{ background: cardBg, borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(139,111,111,0.15)", border: `1.5px solid ${border}`, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #C68A95, #8B5E6A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(198,138,149,0.35)" }}>
            <i className="fa-solid fa-lock" style={{ color: "white", fontSize: 20 }} />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: "normal", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Asistente IA</h1>
          <p style={{ margin: "0 0 24px", fontSize: 12.5, color: textMuted, ...MONO }}>Ingresa el PIN para entrar</p>
          <form onSubmit={verificarPin}>
            <input
              type="password"
              inputMode="numeric"
              value={pinIngresado}
              onChange={(e) => { setPinIngresado(e.target.value); setPinError(false); }}
              autoFocus
              placeholder="••••••"
              style={{
                width: "100%", boxSizing: "border-box", textAlign: "center", letterSpacing: "0.3em",
                fontSize: 20, padding: "12px 16px", borderRadius: 12,
                border: `1.5px solid ${pinError ? "#C0524F" : border}`,
                background: inputBg, color: textMain, outline: "none", fontFamily: "Georgia, serif",
              }}
            />
            {pinError && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#C0524F", ...MONO }}>PIN incorrecto</p>}
            <button
              type="submit"
              style={{ marginTop: 18, width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #C68A95, #8B5E6A)", color: "white", fontSize: 13, ...MONO, cursor: "pointer" }}
            >
              Entrar
            </button>
          </form>
          <button
            onClick={() => router.push("/admin")}
            style={{ marginTop: 16, background: "none", border: "none", color: textMuted, fontSize: 12, ...MONO, cursor: "pointer" }}
          >
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 5 }} />Volver al panel
          </button>
        </div>
      </div>
    );
  }

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
          ) : hilos.length === 0 ? (
            <p style={{ textAlign: "center", color: textMuted, fontSize: 12, ...MONO, marginTop: 20, padding: "0 16px" }}>Sin conversaciones todavía.</p>
          ) : (
            hilos.map((h, idx) => {
              const primero = h.mensajes[0];
              const ultimo = h.mensajes[h.mensajes.length - 1];
              const meta = ESTADO_META[ultimo.estado];
              const seccion = fmtSeccion(ultimo.created_at);
              const seccionAnterior = idx > 0 ? fmtSeccion(hilos[idx - 1].mensajes[hilos[idx - 1].mensajes.length - 1].created_at) : null;
              const isActive = seleccionado === h.id;
              return (
                <div key={h.id}>
                  {seccion !== seccionAnterior && (
                    <p style={{ margin: "14px 8px 6px", fontSize: 10, color: textMuted, ...MONO, textTransform: "uppercase", letterSpacing: "0.08em" }}>{seccion}</p>
                  )}
                  <div
                    onClick={() => setSeleccionado(h.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 10px",
                      borderRadius: 10, cursor: "pointer", marginBottom: 3,
                      background: isActive ? activeBg : "transparent",
                    }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} title={meta.label} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12.5, color: textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titulo(primero)}</p>
                      <p style={{ margin: 0, fontSize: 10, color: textMuted, ...MONO }}>
                        {fmtHora(ultimo.created_at)} · {meta.label}{h.mensajes.length > 1 ? ` · ${h.mensajes.length} mensajes` : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminar(h.id); }}
                      disabled={eliminando === h.id}
                      title="Borrar conversación"
                      style={{ background: "none", border: "none", color: textMuted, fontSize: 12, cursor: "pointer", padding: 4, flexShrink: 0, opacity: 0.6 }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                    >
                      <i className={`fa-solid ${eliminando === h.id ? "fa-spinner fa-spin" : "fa-trash"}`} />
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
        {hiloActivo ? (
          <>
            <div style={{ padding: "16px 24px", borderBottom: `1.5px solid ${border}`, flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: textMuted, ...MONO }}>Conversación #{hiloActivo.id} · {hiloActivo.mensajes.length} mensaje{hiloActivo.mensajes.length !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ maxWidth: 640, margin: "0 auto" }}>
                {hiloActivo.mensajes.map(renderMensaje)}
                <div ref={bottomRef} />
              </div>
            </div>
            {composeBox}
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
            {composeBox}
          </>
        )}
      </div>
    </div>
  );
}
