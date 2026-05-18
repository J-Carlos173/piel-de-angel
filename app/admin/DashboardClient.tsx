"use client";

import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

function fmtPrecio(n: number) {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type Card = {
  icon: string;
  title: string;
  desc: string;
  stat?: string;
  statLabel?: string;
  href?: string;
  external?: boolean;
  accent: string;
  glow: string;
  disabled?: boolean;
};

export default function DashboardClient({
  totalOrders, totalRevenue, thisMonthOrders, thisMonthRevenue,
}: {
  totalOrders: number;
  totalRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
}) {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();

  const bg      = dark ? "#160f13" : "#f5eeec";
  const cardBg  = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.95)";
  const border  = dark ? "#3a2830" : "#ecddd9";
  const textMain= dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";

  const cards: Card[] = [
    {
      icon: "fa-bag-shopping",
      title: "Órdenes",
      desc: "Historial completo de compras y pagos",
      stat: String(totalOrders),
      statLabel: `${thisMonthOrders} este mes`,
      href: "/admin/ordenes",
      accent: "#C68A95",
      glow: "rgba(198,138,149,0.22)",
    },
    {
      icon: "fa-chart-pie",
      title: "Reportes",
      desc: "Ingresos, gráficos de dona y tendencias",
      stat: fmtPrecio(totalRevenue),
      statLabel: `${fmtPrecio(thisMonthRevenue)} este mes`,
      href: "/admin/ventas",
      accent: "#8B6F6F",
      glow: "rgba(139,111,111,0.22)",
    },
    {
      icon: "fa-key",
      title: "Contraseña",
      desc: "Cambiar el acceso privado al panel",
      href: "/admin/password",
      accent: "#B07A85",
      glow: "rgba(176,122,133,0.22)",
    },
    {
      icon: "fa-chart-line",
      title: "Visitas",
      desc: "Tráfico del sitio, páginas populares y tendencias",
      href: "/admin/analytics",
      accent: "#7A5560",
      glow: "rgba(122,85,96,0.22)",
    },
    {
      icon: "fa-calendar-days",
      title: "Agenda",
      desc: "Citas pasadas y próximas del salón",
      href: "/admin/agenda",
      accent: "#C4919A",
      glow: "rgba(196,145,154,0.22)",
    },
    {
      icon: "fa-globe",
      title: "Ver Sitio",
      desc: "Abrir la tienda como la ve el cliente",
      href: "/",
      external: true,
      accent: "#7A9E8A",
      glow: "rgba(122,158,138,0.22)",
    },
    {
      icon: "fa-tag",
      title: "Promociones",
      desc: "Crear y gestionar códigos de descuento",
      href: "/admin/promos",
      accent: "#9B6E7A",
      glow: "rgba(155,110,122,0.22)",
    },
    {
      icon: "fa-box-open",
      title: "Productos",
      desc: "Gestionar catálogo, stock, precios y categorías",
      href: "/admin/productos",
      accent: "#6B4F5A",
      glow: "rgba(107,79,90,0.22)",
    },
  ];

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Georgia, serif", transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(145deg, #5C3D47 0%, #8B5E6A 30%, #C68A95 68%, #E2B4BC 100%)", padding: "36px 32px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -50, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), rgba(255,255,255,0.95), rgba(255,255,255,0.7), transparent)" }} />

        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, position: "relative" }}>
          <div>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif" }}>Panel de administración</p>
            <h1 style={{ margin: "8px 0 3px", color: "#fff", fontSize: 30, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif", textShadow: "0 2px 12px rgba(0,0,0,0.18)" }}>
              Piel de Ángel
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.6)", fontSize: 13, letterSpacing: "0.04em" }}>
              ¿Qué deseas hacer hoy?
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={toggle} style={{ background: "rgba(255,255,255,0.14)", border: "1.5px solid rgba(255,255,255,0.32)", borderRadius: 12, padding: "9px 13px", color: "#fff", fontSize: 15, cursor: "pointer" }}>
              <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
            </button>
            <button onClick={handleLogout} style={{ background: "rgba(0,0,0,0.18)", border: "1.5px solid rgba(255,255,255,0.20)", borderRadius: 12, padding: "9px 14px", color: "rgba(255,255,255,0.82)", fontSize: 13, cursor: "pointer", fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: 7 }}>
              <i className="fa-solid fa-right-from-bracket" /> Salir
            </button>
          </div>
        </div>
      </div>

      {/* Grid de cards */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 16px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {cards.map((card) => (
            <DashboardCard
              key={card.title}
              card={card}
              cardBg={cardBg}
              border={border}
              textMain={textMain}
              textMuted={textMuted}
              onClick={() => {
                if (card.disabled) return;
                if (card.external) { window.open(card.href, "_blank"); return; }
                if (card.href) router.push(card.href);
              }}
            />
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 40, fontSize: 11, color: textMuted, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em" }}>
          ✦ &nbsp; Panel exclusivo · Piel de Ángel &nbsp; ✦
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ card, cardBg, border, textMain, textMuted, onClick }: {
  card: Card; cardBg: string; border: string; textMain: string; textMuted: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={card.disabled}
      style={{
        background: cardBg,
        border: `1.5px solid ${border}`,
        borderRadius: 22,
        padding: "32px 28px",
        textAlign: "left",
        cursor: card.disabled ? "default" : "pointer",
        fontFamily: "Georgia, serif",
        boxShadow: `0 4px 24px ${card.glow}`,
        transition: "transform 0.18s, box-shadow 0.18s",
        opacity: card.disabled ? 0.55 : 1,
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        if (card.disabled) return;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 40px ${card.glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 24px ${card.glow}`;
      }}
    >
      {/* Acento superior */}
      <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2.5, background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`, borderRadius: "0 0 4px 4px" }} />

      {/* Ícono */}
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(145deg, ${card.accent}33, ${card.accent}18)`, border: `1.5px solid ${card.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 4px 16px ${card.glow}` }}>
        <i className={`fa-solid ${card.icon}`} style={{ fontSize: 22, color: card.accent, filter: `drop-shadow(0 2px 4px ${card.glow})` }} />
      </div>

      {/* Texto */}
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: "normal", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{card.title}</h2>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: textMuted, lineHeight: 1.5 }}>{card.desc}</p>

      {/* Stat */}
      {card.stat && (
        <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 700, color: card.accent, fontFamily: "Montserrat, sans-serif", fontVariantNumeric: "tabular-nums" }}>{card.stat}</p>
      )}
      {card.statLabel && (
        <p style={{ margin: 0, fontSize: 11, color: textMuted, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.06em" }}>{card.statLabel}</p>
      )}

      {/* Flecha */}
      {!card.disabled && (
        <i className={card.external ? "fa-solid fa-arrow-up-right-from-square" : "fa-solid fa-arrow-right"} style={{ position: "absolute", bottom: 28, right: 28, color: card.accent, fontSize: 14, opacity: 0.6 }} />
      )}
      {card.disabled && (
        <span style={{ position: "absolute", bottom: 22, right: 22, fontSize: 10, color: textMuted, fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", background: `${card.accent}18`, padding: "3px 10px", borderRadius: 20 }}>Próximamente</span>
      )}
    </button>
  );
}
