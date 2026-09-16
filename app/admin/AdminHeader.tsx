"use client";

import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

type AdminHeaderProps = {
  /** Etiqueta pequeña arriba del título, ej. "Gestión de Reseñas". */
  eyebrow?: string;
  title: string;
  /** Texto bajo el título, solo lo usa el Dashboard raíz. */
  subtitle?: string;
  /** Si se pasa, muestra el botón "Panel" para volver. Las subpáginas siempre lo pasan. */
  backHref?: string;
  maxWidth?: number;
  /** Botones extra antes del toggle de tema, ej. "Salir" en el Dashboard raíz. */
  rightExtra?: React.ReactNode;
  /** Contenido libre bajo el subtítulo, ej. notas o estado dinámico. */
  children?: React.ReactNode;
};

export default function AdminHeader({ eyebrow, title, subtitle, backHref, maxWidth = 980, rightExtra, children }: AdminHeaderProps) {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();

  const border = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted = dark ? "#9a7c86" : "#9a8486";

  return (
    <div className="admin-header" style={{
      background: dark
        ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
        : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
      padding: "32px 32px 28px", position: "relative",
      borderBottom: `1.5px solid ${border}`,
    }}>
      <style>{`
        @media (max-width: 640px) {
          .admin-header { padding: 20px 16px 18px !important; }
        }
      `}</style>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #D8A7B1, #C68A95, #D8A7B1, transparent)" }} />

      <div style={{ maxWidth, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
        <div>
          {backHref && (
            <button
              onClick={() => router.push(backHref)}
              style={{
                background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)",
                border: `1px solid ${border}`, borderRadius: 8, padding: "5px 12px",
                color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer",
                marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
          )}
          {eyebrow && (
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>
              {eyebrow}
            </p>
          )}
          <h1 style={{ margin: "6px 0 2px", color: textMain, fontSize: 28, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ margin: 0, color: textMuted, fontSize: 13, letterSpacing: "0.04em" }}>{subtitle}</p>
          )}
          {children}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {rightExtra}
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
      </div>
    </div>
  );
}
