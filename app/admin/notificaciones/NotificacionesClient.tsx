"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Settings = {
  notif_compras: boolean;
  notif_citas: boolean;
  notif_seguridad: boolean;
};

const ITEMS: { key: keyof Settings; icon: string; title: string; desc: string; accent: string }[] = [
  {
    key: "notif_compras",
    icon: "fa-bag-shopping",
    title: "Compras confirmadas",
    desc: "Recibir un correo cada vez que se confirme un pago en la tienda online",
    accent: "#C68A95",
  },
  {
    key: "notif_citas",
    icon: "fa-calendar-days",
    title: "Solicitudes de cita",
    desc: "Recibir un correo cuando una clienta solicite una hora en la agenda",
    accent: "#8B6F8B",
  },
  {
    key: "notif_seguridad",
    icon: "fa-shield-halved",
    title: "Alertas de seguridad",
    desc: "Recibir aviso cuando se detecten 5 intentos fallidos de acceso al panel",
    accent: "#7A5560",
  },
];

export default function NotificacionesClient({ initial }: { initial: Settings }) {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [settings, setSettings] = useState<Settings>(initial);
  const [saving, setSaving]     = useState<keyof Settings | null>(null);
  const [saved, setSaved]       = useState<keyof Settings | null>(null);

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  async function toggle_notif(key: keyof Settings) {
    const newVal = !settings[key];
    setSaving(key);
    setSettings((prev) => ({ ...prev, [key]: newVal }));
    await fetch("/api/admin/notificaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: newVal }),
    });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg,#1e151a,#1a1218 55%,#1e151a)"
          : "linear-gradient(160deg,#ffffff,#fdf5f7 55%,#f9eef2)",
        padding: "28px 32px 24px", borderBottom: `1.5px solid ${border}`, position: "relative",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#D8A7B1,#C68A95,#D8A7B1,transparent)" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${border}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Preferencias</p>
            <h1 style={{ margin: "6px 0 2px", color: textMain, fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Notificaciones
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: textMuted, ...MONO }}>Activa o desactiva los correos que recibes como administradora</p>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${border}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px 60px", display: "flex", flexDirection: "column", gap: 16 }}>
        {ITEMS.map(({ key, icon, title, desc, accent }) => {
          const active  = settings[key];
          const loading = saving === key;
          const justSaved = saved === key;

          return (
            <div key={key} style={{
              background: cardBg, border: `1.5px solid ${active ? accent + "55" : border}`,
              borderRadius: 20, padding: "24px 28px", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: 20,
              boxShadow: active ? `0 4px 20px ${accent}22` : "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}>
              {/* Ícono + texto */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: active ? `linear-gradient(145deg,${accent}33,${accent}18)` : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                  border: `1.5px solid ${active ? accent + "44" : border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.3s, border-color 0.3s",
                }}>
                  <i className={`fa-solid ${icon}`} style={{ fontSize: 18, color: active ? accent : textMuted, transition: "color 0.3s" }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: "normal" }}>
                    {title}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: textMuted, lineHeight: 1.4, ...MONO }}>
                    {desc}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <button
                  onClick={() => toggle_notif(key)}
                  disabled={loading}
                  style={{
                    width: 52, height: 28, borderRadius: 14, border: "none", cursor: loading ? "default" : "pointer",
                    background: active ? `linear-gradient(135deg,${accent},${accent}bb)` : (dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"),
                    position: "relative", transition: "background 0.3s",
                    boxShadow: active ? `0 2px 8px ${accent}44` : "none",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: active ? 27 : 3, width: 22, height: 22,
                    borderRadius: "50%", background: "#fff",
                    transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {loading && <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 9, color: accent }} />}
                  </span>
                </button>
                <span style={{ fontSize: 10, ...MONO, color: justSaved ? "#7aaa84" : (active ? accent : textMuted), fontWeight: 600, letterSpacing: "0.06em", transition: "color 0.3s" }}>
                  {justSaved ? "¡Guardado!" : active ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
          );
        })}

        <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: textMuted, ...MONO }}>
          Los cambios se aplican de inmediato — no requieren reiniciar el sitio.
        </p>
      </div>
    </div>
  );
}
