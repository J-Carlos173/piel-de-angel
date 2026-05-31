"use client";

import { useState } from "react";

type Season = "spring" | "summer" | "autumn" | "winter";

function getAutoSeason(): Season {
  const m = new Date().getMonth() + 1;
  if (m >= 9 && m <= 11) return "spring";
  if (m === 12 || m <= 2) return "summer";
  if (m >= 3 && m <= 5) return "autumn";
  return "winter";
}

const LEAVES = [
  { id: 1, x:  5, s: 0.80, dur: 9.0,  delay: 0.0, v: "A" },
  { id: 2, x: 22, s: 1.10, dur: 11.5, delay: 2.4, v: "C" },
  { id: 3, x: 38, s: 0.70, dur: 8.5,  delay: 5.0, v: "B" },
  { id: 4, x: 55, s: 1.00, dur: 10.0, delay: 1.2, v: "A" },
  { id: 5, x: 72, s: 0.85, dur: 9.5,  delay: 6.8, v: "C" },
  { id: 6, x: 88, s: 0.75, dur: 12.0, delay: 3.5, v: "B" },
];

// Gotas de lluvia
const DROPS = [
  { id: 1, x:  8, s: 0.9,  dur: 1.8, delay: 0.0 },
  { id: 2, x: 25, s: 1.1,  dur: 2.1, delay: 0.7 },
  { id: 3, x: 42, s: 0.7,  dur: 1.5, delay: 1.4 },
  { id: 4, x: 58, s: 1.0,  dur: 2.3, delay: 0.3 },
  { id: 5, x: 74, s: 0.85, dur: 1.7, delay: 1.9 },
  { id: 6, x: 90, s: 1.2,  dur: 2.0, delay: 0.9 },
];

const COLORS: Record<Season, string[]> = {
  autumn: ["#C45E1A", "#B5651D", "#CD853F", "#A0522D", "#D2691E", "#8B4513"],
  spring: ["#7FA882", "#5B7E64", "#A8D5A2", "#9ACA9E", "#C8E6C9"],
  summer: ["#4A6B52", "#5B7E64", "#3D5940", "#6B9E72", "#4E7A55"],
  winter: ["#A8C0CE", "#8FAFC0", "#C4D8E4", "#7A9EB2", "#B0CCDA"],
};
const OPACITY: Record<Season, number> = { autumn: 0.35, spring: 0.30, summer: 0.28, winter: 0.55 };

const SEASON_META: { key: Season; icon: string; label: string }[] = [
  { key: "spring", icon: "fa-seedling", label: "Primavera" },
  { key: "summer", icon: "fa-sun",      label: "Verano"    },
  { key: "autumn", icon: "fa-leaf",     label: "Otoño"     },
  { key: "winter", icon: "fa-cloud-rain", label: "Invierno" },
];

function LeafPath({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 12 16" width={12} height={16} style={{ display: "block" }}>
      <path
        d="M6,0 C3,3 0,7 0,10.5 C0,13.5 2.7,16 6,16 C9.3,16 12,13.5 12,10.5 C12,7 9,3 6,0 Z"
        fill={fill}
      />
      <path
        d="M6,0 C6.3,5.5 6.1,10 6,16"
        stroke="rgba(0,0,0,0.18)" strokeWidth="0.55" fill="none"
      />
    </svg>
  );
}

function DropPath({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 6 14" width={5} height={12} style={{ display: "block" }}>
      {/* Gota: punta arriba, abombada abajo */}
      <path
        d="M3,0 C3,0 6,5.5 6,8.5 C6,11.5 4.7,14 3,14 C1.3,14 0,11.5 0,8.5 C0,5.5 3,0 3,0 Z"
        fill={fill}
        opacity={0.75}
      />
      {/* Reflejo */}
      <ellipse cx="4.2" cy="7.5" rx="0.7" ry="1.4" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
}

export default function FallingLeaves() {
  const [season, setSeason] = useState<Season>(getAutoSeason);
  const [open, setOpen] = useState(false);

  const palette = COLORS[season];
  const op = OPACITY[season];
  const current = SEASON_META.find((s) => s.key === season)!;
  const isWinter = season === "winter";

  return (
    <>
      <style>{`
        @keyframes fall-A {
          0%   { transform: translateY(-70px) translateX(0px)   rotate(-15deg); opacity: 0; }
          8%   { opacity: ${isWinter ? op : op}; }
          88%  { opacity: ${isWinter ? op * 0.8 : op * 0.75}; }
          100% { transform: translateY(108vh) translateX(28px)  rotate(210deg); opacity: 0; }
        }
        @keyframes fall-B {
          0%   { transform: translateY(-70px) translateX(0px)   rotate(20deg);  opacity: 0; }
          8%   { opacity: ${op}; }
          88%  { opacity: ${op * 0.75}; }
          100% { transform: translateY(108vh) translateX(-32px) rotate(-190deg); opacity: 0; }
        }
        @keyframes fall-C {
          0%   { transform: translateY(-70px) translateX(0px)   rotate(5deg);   opacity: 0; }
          8%   { opacity: ${op}; }
          88%  { opacity: ${op * 0.75}; }
          100% { transform: translateY(108vh) translateX(10px)  rotate(260deg); opacity: 0; }
        }
        @keyframes rain-fall {
          0%   { transform: translateY(-20px) translateX(0px); opacity: 0; }
          6%   { opacity: ${op}; }
          90%  { opacity: ${op * 0.85}; }
          100% { transform: translateY(108vh) translateX(8px); opacity: 0; }
        }
      `}</style>

      {/* Partículas */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {isWinter
          ? DROPS.map((drop, i) => (
              <div
                key={`winter-${drop.id}`}
                style={{
                  position: "absolute",
                  left: `${drop.x}%`,
                  top: 0,
                  transform: `scale(${drop.s})`,
                  transformOrigin: "top left",
                }}
              >
                <div style={{ animation: `rain-fall ${drop.dur}s linear ${drop.delay}s infinite` }}>
                  <DropPath fill={palette[i % palette.length]} />
                </div>
              </div>
            ))
          : LEAVES.map((leaf, i) => (
              <div
                key={`${season}-${leaf.id}`}
                style={{
                  position: "absolute",
                  left: `${leaf.x}%`,
                  top: 0,
                  transform: `scale(${leaf.s})`,
                  transformOrigin: "top left",
                }}
              >
                <div style={{ animation: `fall-${leaf.v} ${leaf.dur}s ease-in ${leaf.delay}s infinite` }}>
                  <LeafPath fill={palette[i % palette.length]} />
                </div>
              </div>
            ))}
      </div>

      {/* Selector de estación */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        {open && SEASON_META.filter((s) => s.key !== season).map((s) => (
          <button
            key={s.key}
            onClick={() => { setSeason(s.key); setOpen(false); }}
            title={s.label}
            style={{
              width: 38, height: 38,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              border: "1.5px solid rgba(198,138,149,0.35)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              fontSize: 15,
              color: "#8B6F6F",
              backdropFilter: "blur(8px)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <i className={`fa-solid ${s.icon}`} />
          </button>
        ))}

        <button
          onClick={() => setOpen((v) => !v)}
          title={current.label}
          style={{
            width: 42, height: 42,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #C68A95, #8B6F6F)",
            border: "none",
            boxShadow: "0 4px 18px rgba(198,138,149,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            fontSize: 17,
            color: "#fff",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <i className={`fa-solid ${current.icon}`} />
        </button>
      </div>
    </>
  );
}
