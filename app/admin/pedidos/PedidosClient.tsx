"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Pedido = {
  id: number;
  texto: string;
  estado: "pendiente" | "en_proceso" | "hecho" | "error";
  respuesta: string | null;
  created_at: string;
  completed_at: string | null;
};

const ESTADO_META: Record<Pedido["estado"], { label: string; color: string; bg: string; icon: string }> = {
  pendiente:  { label: "Pendiente",  color: "#B08A00", bg: "rgba(176,138,0,0.12)",   icon: "fa-clock" },
  en_proceso: { label: "En proceso", color: "#3A6FB0", bg: "rgba(58,111,176,0.12)",  icon: "fa-spinner fa-spin" },
  hecho:      { label: "Hecho",      color: "#4CAF85", bg: "rgba(76,175,133,0.12)",  icon: "fa-circle-check" },
  error:      { label: "Con error",  color: "#C0524F", bg: "rgba(192,82,79,0.12)",   icon: "fa-triangle-exclamation" },
};

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function PedidosClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
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
    const interval = setInterval(cargar, 15000);
    return () => clearInterval(interval);
  }, []);

  async function enviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: texto.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.pedido) { setError(data.error || "Error al enviar. Intenta de nuevo."); return; }
      setPedidos((prev) => [data.pedido, ...prev]);
      setTexto("");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: inputBg, border: `1px solid ${border}`,
    borderRadius: 10, padding: "12px 14px", color: textMain,
    fontSize: 14, fontFamily: "Georgia, serif", outline: "none", boxSizing: "border-box",
    resize: "vertical", minHeight: 90,
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s", fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
        padding: "32px 32px 28px",
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #ecddd9",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Pedidos para Claude</p>
            <h1 style={{ margin: "6px 0 4px", color: textMain, fontSize: 28, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              ¿Qué necesitas cambiar?
            </h1>
            <p style={{ margin: 0, color: textMuted, fontSize: 13, maxWidth: 480 }}>
              Escribe tu pedido con el mayor detalle posible. Claude lo revisa y lo implementa —
              vuelve a esta página para ver el estado.
            </p>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer", flexShrink: 0 }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Formulario */}
        <div style={{ background: cardBg, border: `1.5px solid #C68A95`, borderRadius: 20, padding: 22, boxShadow: "0 4px 30px rgba(198,138,149,0.14)", marginBottom: 28 }}>
          <textarea
            placeholder="Ej: cambia el precio del servicio de lifting de pestañas a $15.000, o agrega un banner de promoción de primavera en la home..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            style={inputStyle}
          />
          {error && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#e57373", ...MONO }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5 }} />{error}
            </p>
          )}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={enviar}
              disabled={enviando || !texto.trim()}
              style={{ background: "linear-gradient(135deg, #C68A95, #8B5E6A)", border: "none", borderRadius: 10, padding: "11px 26px", color: "#fff", fontSize: 13, cursor: enviando ? "wait" : "pointer", opacity: !texto.trim() ? 0.6 : 1, ...MONO, display: "flex", alignItems: "center", gap: 8 }}
            >
              {enviando ? <><i className="fa-solid fa-spinner fa-spin" /> Enviando...</> : <><i className="fa-solid fa-paper-plane" /> Enviar pedido</>}
            </button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, ...MONO }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 22, marginBottom: 10, display: "block" }} />
            Cargando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: textMuted, fontSize: 13, ...MONO }}>
            Todavía no hay pedidos.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pedidos.map((p) => {
              const meta = ESTADO_META[p.estado];
              return (
                <div key={p.id} style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 16, padding: "18px 20px", boxShadow: "0 2px 14px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{ background: meta.bg, color: meta.color, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, ...MONO, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <i className={`fa-solid ${meta.icon}`} /> {meta.label}
                    </span>
                    <span style={{ fontSize: 11, color: textMuted, ...MONO, flexShrink: 0 }}>{fmtFecha(p.created_at)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: textMain, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{p.texto}</p>
                  {p.respuesta && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${border}` }}>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: textMuted, textTransform: "uppercase", letterSpacing: "0.08em", ...MONO }}>Respuesta</p>
                      <p style={{ margin: 0, fontSize: 13, color: textMuted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{p.respuesta}</p>
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
