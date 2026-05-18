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
  { id: 1,  x:  5, s: 0.80, dur: 9.0,  delay: 0.0, v: "A" },
  { id: 2,  x: 14, s: 1.10, dur: 11.5, delay: 2.4, v: "C" },
  { id: 3,  x: 27, s: 0.70, dur: 8.5,  delay: 5.0, v: "B" },
  { id: 4,  x: 38, s: 1.00, dur: 10.0, delay: 1.2, v: "A" },
  { id: 5,  x: 52, s: 0.85, dur: 9.5,  delay: 6.8, v: "C" },
  { id: 6,  x: 63, s: 0.75, dur: 12.0, delay: 3.5, v: "B" },
  { id: 7,  x: 74, s: 1.05, dur: 8.0,  delay: 0.8, v: "A" },
  { id: 8,  x: 83, s: 0.90, dur: 10.5, delay: 4.2, v: "C" },
  { id: 9,  x: 91, s: 0.65, dur: 7.5,  delay: 7.5, v: "B" },
  { id: 10, x: 44, s: 1.15, dur: 11.0, delay: 9.0, v: "A" },
];

// Gotas de lluvia: caen más recto y más rápido
const DROPS = [
  { id: 1,  x:  8, s: 0.9,  dur: 1.8, delay: 0.0  },
  { id: 2,  x: 18, s: 1.1,  dur: 2.1, delay: 0.7  },
  { id: 3,  x: 29, s: 0.7,  dur: 1.5, delay: 1.4  },
  { id: 4,  x: 41, s: 1.0,  dur: 2.3, delay: 0.3  },
  { id: 5,  x: 55, s: 0.85, dur: 1.7, delay: 1.9  },
  { id: 6,  x: 66, s: 1.2,  dur: 2.0, delay: 0.9  },
  { id: 7,  x: 76, s: 0.75, dur: 1.6, delay: 2.5  },
  { id: 8,  x: 85, s: 1.05, dur: 2.4, delay: 0.5  },
  { id: 9,  x: 93, s: 0.65, dur: 1.9, delay: 1.1  },
  { id: 10, x: 48, s: 0.95, dur: 2.2, delay: 3.0  },
  { id: 11, x: 33, s: 0.80, dur: 1.4, delay: 2.2  },
  { id: 12, x: 61, s: 1.15, dur: 2.6, delay: 1.6  },
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
          zIndex: 10,
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
