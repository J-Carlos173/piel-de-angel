"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "pieldeangel_fondo_elegido";

type Estilo = {
  id: string;
  nombre: string;
  desc: string;
};

const ESTILOS: Estilo[] = [
  { id: "malla", nombre: "Malla de gradientes", desc: "Blobs difuminados en movimiento — look premium tipo sitio hecho con IA" },
  { id: "grano", nombre: "Textura de grano", desc: "Grano sutil sobre color plano, aire editorial discreto" },
  { id: "aurora", nombre: "Aurora animada", desc: "Gradiente fluido que se mueve lento de fondo" },
  { id: "lujo", nombre: "Lujo oscuro", desc: "Fondo oscuro con acentos dorados y rosa — pensado para verse igual en modo claro y oscuro" },
  { id: "botanico", nombre: "Patrón botánico sutil", desc: "Hojitas chicas y estáticas en muy baja opacidad — reemplazo elegante de las hojas animadas, sin movimiento" },
  { id: "terracota", nombre: "Terracota cálida", desc: "Tonos tierra y arena — look 'spa natural', tendencia en marcas de skincare con enfoque orgánico" },
  { id: "ondas", nombre: "Ondas suaves", desc: "Curva orgánica en la base de la sección" },
  { id: "minimal", nombre: "Minimalista", desc: "Solo color plano, sin decoración — el punto de comparación" },
];

export default function FondosPage() {
  const [dark, setDark] = useState(false);
  const [elegido, setElegido] = useState<string | null>(null);

  // Se lee despues del montaje (no en el render inicial) para que coincida
  // con el HTML pre-renderizado y no genere un mismatch de hidratacion.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setElegido(saved);
    } catch {}
  }, []);

  function elegir(id: string) {
    setElegido(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }

  return (
    <div className={dark ? "fondos-page fondos-dark" : "fondos-page"} style={{ minHeight: "100vh", background: dark ? "#1C1917" : "#f5eeec", fontFamily: "Georgia, serif", transition: "background 0.3s" }}>
      <style>{`
        @keyframes fondoBlobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 25px) scale(1.1); }
        }
        @keyframes fondoAurora {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .fondo-preview {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-top: 1px solid rgba(0,0,0,0.06);
          transition: background 0.3s;
        }
        .fondos-dark .fondo-preview { border-top-color: rgba(255,255,255,0.08); }
        .fondo-label {
          position: absolute;
          top: 20px; left: 20px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 14px;
          padding: 10px 16px;
          max-width: 340px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          z-index: 3;
        }
        .fondo-label strong {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 15px;
          color: #2e1e24;
          margin-bottom: 3px;
        }
        .fondo-label span {
          font-family: Montserrat, sans-serif;
          font-size: 11.5px;
          color: #7a6b70;
          line-height: 1.4;
        }
        .fondo-elegir-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
          background: rgba(198,138,149,0.1);
          border: 1px solid rgba(198,138,149,0.4);
          border-radius: 100px;
          padding: 6px 13px;
          font-family: Montserrat, sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.4px;
          color: #C68A95;
          cursor: pointer;
          transition: transform 0.15s, background 0.2s;
        }
        .fondo-elegir-btn:hover { transform: translateY(-1px); background: rgba(198,138,149,0.18); }
        .fondo-elegir-btn.elegido {
          background: #C68A95;
          border-color: #C68A95;
          color: white;
        }
        .fondo-preview.elegido {
          box-shadow: inset 0 0 0 4px #C68A95;
        }
        .fondos-dark .fondo-elegir-btn { background: rgba(212,175,110,0.14); border-color: rgba(212,175,110,0.4); color: #D4AF6E; }
        .fondos-dark .fondo-elegir-btn:hover { background: rgba(212,175,110,0.24); }
        .fondos-dark .fondo-elegir-btn.elegido { background: #D4AF6E; border-color: #D4AF6E; color: #1C1917; }
        .fondos-dark .fondo-preview.elegido { box-shadow: inset 0 0 0 4px #D4AF6E; }
        .fondo-mock {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 20px;
        }
        .fondo-mock .eyebrow {
          font-family: Montserrat, sans-serif;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 11px;
          color: #C68A95;
          font-weight: 500;
        }
        .fondo-mock h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.4rem;
          font-weight: 400;
          color: #2e1e24;
          margin: 10px 0 8px;
        }
        .fondo-mock h2 em { font-style: italic; color: #C68A95; }
        .fondo-mock p {
          font-family: Montserrat, sans-serif;
          font-size: 13px;
          color: #6E6765;
          max-width: 320px;
          margin: 0 auto 20px;
        }
        .fondo-mock button {
          font-family: Montserrat, sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 13px 30px;
          border-radius: 100px;
          background: #C68A95;
          color: white;
          border: none;
          box-shadow: 0 10px 30px rgba(198,138,149,0.35);
        }

        /* 1. Malla de gradientes */
        .bg-malla { background: #FBFAF8; }
        .bg-malla::before, .bg-malla::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
        }
        .bg-malla::before {
          top: -120px; right: -80px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(216,167,177,0.45) 0%, transparent 65%);
          animation: fondoBlobFloat 14s ease-in-out infinite;
        }
        .bg-malla::after {
          bottom: -120px; left: -80px;
          width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(139,111,111,0.30) 0%, transparent 65%);
          animation: fondoBlobFloat 18s ease-in-out infinite reverse;
        }

        /* 2. Grano */
        .bg-grano { background: #F7F5F2; }
        .bg-grano::before {
          content: "";
          position: absolute; inset: 0;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* 3. Aurora animada */
        .bg-aurora {
          background: linear-gradient(120deg, #FBFAF8 0%, #F0DCE0 25%, #E8C6CC 50%, #F4E8E5 75%, #FBFAF8 100%);
          background-size: 300% 300%;
          animation: fondoAurora 12s ease infinite;
        }

        /* Lujo oscuro (siempre oscuro, con o sin toggle) */
        .bg-lujo { background: #1C1917; }
        .bg-lujo::before, .bg-lujo::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          filter: blur(10px);
        }
        .bg-lujo::before {
          top: -140px; left: 50%;
          transform: translateX(-50%);
          width: 640px; height: 640px;
          background: radial-gradient(circle, rgba(198,138,149,0.35) 0%, transparent 60%);
          animation: fondoBlobFloat 16s ease-in-out infinite;
        }
        .bg-lujo::after {
          bottom: -140px; right: 8%;
          width: 460px; height: 460px;
          background: radial-gradient(circle, rgba(212,175,110,0.28) 0%, transparent 60%);
          animation: fondoBlobFloat 20s ease-in-out infinite reverse;
        }
        .bg-lujo .fondo-mock .eyebrow { color: #D4AF6E; }
        .bg-lujo .fondo-mock h2 { color: #F5EDE8; }
        .bg-lujo .fondo-mock h2 em { color: #E8B4BC; }
        .bg-lujo .fondo-mock p { color: rgba(245,237,232,0.65); }
        .bg-lujo .fondo-mock button { background: linear-gradient(135deg, #D4AF6E, #C68A95); box-shadow: 0 10px 30px rgba(212,175,110,0.3); }
        .bg-lujo .fondo-label { background: rgba(28,25,23,0.8); }
        .bg-lujo .fondo-label strong { color: #F5EDE8; }
        .bg-lujo .fondo-label span { color: rgba(245,237,232,0.6); }

        /* 4. Botanico sutil */
        .bg-botanico {
          background-color: #FBFAF8;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40,8 C50,5 62,15 63,28 C64,40 55,52 45,58 C42,60 37,60 34,57 C26,51 22,40 25,29 C27,18 33,10 40,8 Z' fill='%235B7E64' opacity='0.06'/%3E%3C/svg%3E");
          background-size: 80px 80px;
        }

        /* Terracota calida */
        .bg-terracota {
          background: linear-gradient(160deg, #F4E4D4 0%, #E8C9A8 45%, #D9A87E 100%);
        }
        .bg-terracota .fondo-mock .eyebrow { color: #9C6B3E; }
        .bg-terracota .fondo-mock h2 em { color: #A9713F; }
        .bg-terracota .fondo-mock button { background: #A9713F; box-shadow: 0 10px 30px rgba(169,113,63,0.35); }

        /* 5. Ondas suaves */
        .bg-ondas { background: linear-gradient(180deg, #FBFAF8 0%, #F4E8E5 100%); }
        .bg-ondas svg { position: absolute; bottom: -2px; left: 0; width: 100%; height: 140px; }

        /* 6. Minimalista */
        .bg-minimal { background: #F7F5F2; }

        @media (max-width: 640px) {
          .fondo-mock h2 { font-size: 1.7rem; }
        }

        /* ===========================================================
           MODO OSCURO — como se verían estos fondos con el tema nocturno
           del sitio. Va al final para ganar el cascade sobre las reglas
           de arriba en los casos de igual especificidad (ej. terracota).
           =========================================================== */
        .fondos-dark .bg-malla { background: #1C1917; }
        .fondos-dark .bg-malla::before { background: radial-gradient(circle, rgba(216,167,177,0.32) 0%, transparent 65%); }
        .fondos-dark .bg-malla::after { background: radial-gradient(circle, rgba(212,175,110,0.22) 0%, transparent 65%); }

        .fondos-dark .bg-grano { background: #1C1917; }
        .fondos-dark .bg-grano::before { opacity: 0.08; }

        .fondos-dark .bg-aurora {
          background: linear-gradient(120deg, #1C1917 0%, #2E2126 25%, #3D2530 50%, #241B1E 75%, #1C1917 100%);
          background-size: 300% 300%;
        }

        .fondos-dark .bg-botanico {
          background-color: #1C1917;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40,8 C50,5 62,15 63,28 C64,40 55,52 45,58 C42,60 37,60 34,57 C26,51 22,40 25,29 C27,18 33,10 40,8 Z' fill='%23D4AF6E' opacity='0.10'/%3E%3C/svg%3E");
        }

        .fondos-dark .bg-terracota {
          background: linear-gradient(160deg, #3D2818 0%, #4A3020 45%, #5C3A22 100%);
        }

        .fondos-dark .bg-ondas { background: linear-gradient(180deg, #1C1917 0%, #2A1F22 100%); }
        .fondos-dark .bg-ondas svg path:nth-child(1) { fill: #D4AF6E; opacity: 0.14; }
        .fondos-dark .bg-ondas svg path:nth-child(2) { fill: #C68A95; opacity: 0.12; }

        .fondos-dark .bg-minimal { background: #1C1917; }

        /* Texto claro sobre cualquier fondo oscuro (menos lujo, que ya es siempre oscuro) */
        .fondos-dark .fondo-mock .eyebrow { color: #E8B4BC; }
        .fondos-dark .fondo-mock h2 { color: #F5EDE8; }
        .fondos-dark .fondo-mock h2 em { color: #E8B4BC; }
        .fondos-dark .fondo-mock p { color: rgba(245,237,232,0.65); }
        .fondos-dark .fondo-mock button { background: linear-gradient(135deg, #D4AF6E, #C68A95); box-shadow: 0 10px 30px rgba(212,175,110,0.3); }
        .fondos-dark .fondo-label { background: rgba(28,25,23,0.82); }
        .fondos-dark .fondo-label strong { color: #F5EDE8; }
        .fondos-dark .fondo-label span { color: rgba(245,237,232,0.6); }
      `}</style>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
        padding: "32px 32px 28px",
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #ecddd9",
        transition: "background 0.3s",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <Link href="/admin" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)",
              border: `1px solid ${dark ? "#3a2830" : "#ecddd9"}`,
              borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12,
              fontFamily: "Montserrat, sans-serif", marginBottom: 12, textDecoration: "none",
            }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </Link>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif" }}>
              Galería privada
            </p>
            <h1 style={{ margin: "6px 0 4px", color: dark ? "#f0dde6" : "#2e1e24", fontSize: 28, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Diseños de Fondo
            </h1>
            <p style={{ margin: 0, color: dark ? "#9a8486" : "#9a8486", fontSize: 13, maxWidth: 560 }}>
              Página de prueba, no está enlazada desde el sitio público. Usa el botón de sol/luna para ver
              cómo se vería cada fondo en modo claro y en modo oscuro del sitio, y &quot;Elegir&quot; para marcar tu favorito.
            </p>
            {elegido && (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: dark ? "#e8b4bc" : "#C68A95", fontFamily: "Montserrat, sans-serif" }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                Elegido: <strong>{ESTILOS.find((e) => e.id === elegido)?.nombre}</strong>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            style={{
              flexShrink: 0,
              display: "flex", alignItems: "center", gap: 9,
              background: dark ? "rgba(212,175,110,0.15)" : "rgba(198,138,149,0.08)",
              border: `1.5px solid ${dark ? "#6a3a42" : "#e8c6cc"}`,
              borderRadius: 100, padding: "10px 18px 10px 10px",
              color: dark ? "#e8b4bc" : "#C68A95", fontSize: 13,
              fontFamily: "Montserrat, sans-serif", cursor: "pointer",
            }}
          >
            <span style={{
              width: 30, height: 30, borderRadius: "50%",
              background: dark ? "linear-gradient(135deg, #D4AF6E, #C68A95)" : "linear-gradient(135deg, #FCD34D, #FBBF24)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13,
            }}>
              <i className={`fa-solid ${dark ? "fa-moon" : "fa-sun"}`} />
            </span>
            {dark ? "Modo oscuro" : "Modo claro"}
          </button>
        </div>
      </div>

      {/* Previews */}
      {ESTILOS.map((estilo) => {
        const isElegido = elegido === estilo.id;
        return (
        <div key={estilo.id} className={`fondo-preview bg-${estilo.id}${isElegido ? " elegido" : ""}`}>
          <div className="fondo-label">
            <strong>{estilo.nombre}</strong>
            <span>{estilo.desc}</span>
            <br />
            <button
              type="button"
              className={`fondo-elegir-btn${isElegido ? " elegido" : ""}`}
              onClick={() => elegir(estilo.id)}
            >
              <i className={`fa-solid ${isElegido ? "fa-check" : "fa-heart"}`} />
              {isElegido ? "Elegido" : "Elegir este"}
            </button>
          </div>

          <div className="fondo-mock">
            <span className="eyebrow">Clínica Estética Premium</span>
            <h2>Realza tu <em>belleza natural</em></h2>
            <p>Así se vería un título y botón reales sobre este fondo, para que sea fácil comparar.</p>
            <button type="button">Reservar Hora</button>
          </div>

          {estilo.id === "ondas" && (
            <svg viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden>
              <path d="M0,60 C300,140 900,0 1200,80 L1200,140 L0,140 Z" fill="#C68A95" opacity="0.10" />
              <path d="M0,90 C300,40 900,140 1200,60 L1200,140 L0,140 Z" fill="#8B6F6F" opacity="0.08" />
            </svg>
          )}
        </div>
        );
      })}

      <p style={{ textAlign: "center", padding: "40px 16px", fontSize: 11, color: dark ? "#9a7c86" : "#9a8486", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.1em" }}>
        ✦ &nbsp; Fin de la galería &nbsp; ✦
      </p>
    </div>
  );
}
