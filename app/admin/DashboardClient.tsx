"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

function fmtPrecio(n: number) {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type NavItem = { icon: string; label: string; href: string; external?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { icon: "fa-house", label: "Inicio", href: "/admin" },
      { icon: "fa-bag-shopping", label: "Órdenes", href: "/admin/ordenes" },
      { icon: "fa-calendar-days", label: "Agenda", href: "/admin/agenda" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { icon: "fa-box-open", label: "Productos", href: "/admin/productos" },
      { icon: "fa-spa", label: "Servicios", href: "/admin/servicios" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { icon: "fa-tag", label: "Promociones", href: "/admin/promos" },
      { icon: "fa-gift", label: "Concursos y avisos", href: "/admin/promos-web" },
      { icon: "fa-heart", label: "Reseñas", href: "/admin/reviews" },
      { icon: "fa-lightbulb", label: "Consejos de piel", href: "/admin/consejos" },
    ],
  },
  {
    label: "Contenido",
    items: [
      { icon: "fa-pen-to-square", label: "Editor Web", href: "/admin/contenido" },
      { icon: "fa-wand-magic-sparkles", label: "Asistente IA", href: "/admin/pedidos" },
      { icon: "fa-palette", label: "Diseños de Fondo", href: "/admin/fondos" },
    ],
  },
  {
    label: "Negocio",
    items: [
      { icon: "fa-chart-pie", label: "Reportes", href: "/admin/ventas" },
      { icon: "fa-chart-line", label: "Visitas", href: "/admin/analytics" },
      { icon: "fa-list-check", label: "Tareas y notas", href: "/admin/tareas" },
      { icon: "fa-bell", label: "Notificaciones", href: "/admin/notificaciones" },
      { icon: "fa-key", label: "Contraseña", href: "/admin/password" },
    ],
  },
];

type Highlight = {
  icon: string;
  title: string;
  desc: string;
  stat?: string;
  href: string;
};

export default function DashboardClient({
  totalOrders, totalRevenue, thisMonthOrders, thisMonthRevenue, tareasPendientes,
}: {
  totalOrders: number;
  totalRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  tareasPendientes: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { dark, toggle } = useThemeStore();
  const [navOpen, setNavOpen] = useState(false);

  const bg = dark ? "#17111450" : "#FBFAF8";
  const cardBg = dark ? "rgba(42,28,34,0.95)" : "#ffffff";
  const border = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted = dark ? "#9a7c86" : "#9a8486";

  const highlights: Highlight[] = [
    {
      icon: "fa-bag-shopping",
      title: "Órdenes",
      desc: `${thisMonthOrders} este mes`,
      stat: String(totalOrders),
      href: "/admin/ordenes",
    },
    {
      icon: "fa-calendar-days",
      title: "Agenda",
      desc: "Citas pasadas y próximas del salón",
      href: "/admin/agenda",
    },
    {
      icon: "fa-box-open",
      title: "Productos y servicios",
      desc: "Catálogo, stock, precios y categorías",
      href: "/admin/productos",
    },
    {
      icon: "fa-chart-pie",
      title: "Reportes",
      desc: `${fmtPrecio(thisMonthRevenue)} este mes`,
      stat: fmtPrecio(totalRevenue),
      href: "/admin/ventas",
    },
    {
      icon: "fa-list-check",
      title: "Tareas y notas",
      desc: tareasPendientes === 1 ? "pendiente" : "pendientes",
      stat: String(tareasPendientes),
      href: "/admin/tareas",
    },
  ];

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  function go(item: NavItem) {
    setNavOpen(false);
    if (item.external) { window.open(item.href, "_blank"); return; }
    router.push(item.href);
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Georgia, serif" }}>
      <style>{`
        .pda-shell { display: flex; min-height: 100vh; }
        .pda-sidebar {
          width: 250px; flex-shrink: 0;
          display: flex; flex-direction: column;
          padding: 26px 18px;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }
        .pda-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 13.5px; cursor: pointer; border: none; width: 100%;
          text-align: left; background: transparent;
          font-family: Montserrat, sans-serif;
          transition: background 0.15s ease;
        }
        .pda-nav-item i { width: 16px; text-align: center; font-size: 13px; }
        .pda-nav-item:hover { background: rgba(255,255,255,0.08); }
        .pda-nav-item.active { background: #ffffff; }
        .pda-group-label {
          font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
          font-family: Montserrat, sans-serif; opacity: 0.55;
          margin: 18px 0 6px 14px;
        }
        .pda-group-label:first-of-type { margin-top: 4px; }
        .pda-card {
          position: relative; text-align: left; width: 100%; cursor: pointer;
          border-radius: 16px; padding: 20px 22px;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          display: flex; align-items: center; gap: 16px;
        }
        .pda-card:hover { transform: translateY(-2px); }
        .pda-mobile-toggle { display: none; }
        @media (max-width: 860px) {
          .pda-shell { flex-direction: column; }
          .pda-sidebar { width: 100%; height: auto; position: relative; padding: 16px; }
          .pda-mobile-toggle { display: flex; }
          .pda-nav-wrap { display: none; }
          .pda-nav-wrap.open { display: block; margin-top: 14px; }
          .pda-main { padding: 24px 18px 60px !important; }
        }
      `}</style>

      <div className="pda-shell">
        {/* Sidebar */}
        <aside
          className="pda-sidebar"
          style={{
            background: dark
              ? "linear-gradient(165deg, #2a1c22 0%, #1c1318 100%)"
              : "linear-gradient(165deg, #4A2E3A 0%, #3A2530 100%)",
            color: "#f3e4e9",
          }}
        >
          <div style={{ padding: "4px 14px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, color: "#fff" }}>
                Piel de Ángel
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.6, ...MONO }}>Panel de administración</p>
            </div>
            <button
              className="pda-mobile-toggle"
              onClick={() => setNavOpen((v) => !v)}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8, padding: "8px 11px", color: "#f3e4e9", cursor: "pointer", alignItems: "center",
              }}
            >
              <i className={`fa-solid ${navOpen ? "fa-xmark" : "fa-bars"}`} />
            </button>
          </div>

          <nav className={`pda-nav-wrap${navOpen ? " open" : ""}`} style={{ flex: 1 }}>
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="pda-group-label" style={{ color: "#f3e4e9" }}>{group.label}</p>
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      className={`pda-nav-item${active ? " active" : ""}`}
                      onClick={() => go(item)}
                      style={{ color: active ? "#4A2E3A" : "#f3e4e9" }}
                    >
                      <i className={`fa-solid ${item.icon}`} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}

            <p className="pda-group-label" style={{ color: "#f3e4e9" }}>&nbsp;</p>
            <button className="pda-nav-item" onClick={() => window.open("/", "_blank")} style={{ color: "#f3e4e9" }}>
              <i className="fa-solid fa-globe" />
              Ver sitio
            </button>
          </nav>

          <button
            onClick={handleLogout}
            style={{
              marginTop: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "9px 14px", color: "#f3e4e9", fontSize: 12.5, cursor: "pointer",
              fontFamily: "Montserrat, sans-serif", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <i className="fa-solid fa-right-from-bracket" /> Cerrar sesión
          </button>
        </aside>

        {/* Main */}
        <main className="pda-main" style={{ flex: 1, padding: "40px 48px 70px", maxWidth: 980 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 6 }}>
            <p style={{ margin: 0, color: textMuted, fontSize: 13, ...MONO }}>Hola, Tere</p>
            <button
              onClick={toggle}
              style={{
                background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)",
                border: `1.5px solid ${border}`, borderRadius: 12, padding: "9px 13px",
                color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer",
              }}
            >
              <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
            </button>
          </div>

          <h1 style={{ margin: "0 0 24px", fontSize: 32, fontWeight: "normal", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            ¿Qué quieres actualizar hoy?
          </h1>

          {tareasPendientes > 0 && (
            <div
              style={{
                background: dark ? "rgba(196,154,74,0.12)" : "#FDF6E3",
                border: `1.5px solid ${dark ? "#5a4a2a" : "#EFE0B0"}`,
                borderRadius: 12, padding: "13px 18px", marginBottom: 24,
                display: "flex", alignItems: "center", gap: 10,
                color: dark ? "#e8cf8a" : "#8a6d1f", fontSize: 13.5,
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" />
              Tienes {tareasPendientes} {tareasPendientes === 1 ? "tarea pendiente" : "tareas pendientes"} en{" "}
              <a onClick={() => router.push("/admin/tareas")} style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>
                Tareas y notas
              </a>
              .
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
            {highlights.map((h) => (
              <button
                key={h.title}
                className="pda-card"
                onClick={() => router.push(h.href)}
                style={{ background: cardBg, border: `1.5px solid ${border}`, boxShadow: dark ? "none" : "0 2px 10px rgba(110,103,101,0.06)" }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                  background: dark ? "rgba(198,138,149,0.16)" : "rgba(198,138,149,0.10)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${h.icon}`} style={{ fontSize: 17, color: "#C68A95" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15.5, fontWeight: "bold", color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{h.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12.5, color: textMuted }}>
                    {h.stat ? <><strong style={{ color: textMain }}>{h.stat}</strong> · {h.desc}</> : h.desc}
                  </p>
                </div>
                <i className="fa-solid fa-arrow-right" style={{ color: "#C68A95", fontSize: 13, opacity: 0.6, flexShrink: 0 }} />
              </button>
            ))}
          </div>

          <div style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 16, padding: "24px 26px" }}>
            <p style={{ margin: "0 0 16px", fontSize: 15, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Resumen · este mes
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Órdenes", value: String(thisMonthOrders) },
                { label: "Ingresos", value: fmtPrecio(thisMonthRevenue) },
                { label: "Tareas pendientes", value: String(tareasPendientes) },
              ].map((s) => (
                <div key={s.label} style={{ background: dark ? "rgba(255,255,255,0.04)" : "#FBFAF8", borderRadius: 10, padding: "14px 16px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: textMuted, ...MONO }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: textMain, ...MONO, fontVariantNumeric: "tabular-nums" }}>{s.value}</p>
                </div>
              ))}
            </div>
            <a onClick={() => router.push("/admin/ventas")} style={{ fontSize: 12.5, color: "#C68A95", cursor: "pointer", fontWeight: 600, ...MONO }}>
              Ver el detalle →
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
