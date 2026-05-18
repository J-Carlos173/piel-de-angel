"use client";

function getSeason(): "spring" | "summer" | "autumn" | "winter" {
  const m = new Date().getMonth() + 1;
  if (m >= 9 && m <= 11) return "spring";
  if (m === 12 || m <= 2) return "summer";
  if (m >= 3 && m <= 5) return "autumn";
  return "winter";
}

// Cada hoja: posición X (%), escala, duración (s), delay (s), variante de trayectoria
const LEAVES = [
  { id: 1,  x:  5, s: 0.80, dur: 9.0, delay: 0.0, v: "A" },
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

const COLORS = {
  autumn: ["#C45E1A", "#B5651D", "#CD853F", "#A0522D", "#D2691E", "#8B4513"],
  spring: ["#7FA882", "#5B7E64", "#A8D5A2", "#9ACA9E", "#C8E6C9"],
  summer: ["#4A6B52", "#5B7E64", "#3D5940", "#6B9E72", "#4E7A55"],
  winter: ["#9AAAB8", "#8898A8", "#B2C4D2", "#7A8E9E"],
};
const OPACITY = { autumn: 0.35, spring: 0.30, summer: 0.28, winter: 0.18 };

// Forma de la hoja con nervadura
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

export default function FallingLeaves() {
  const season = getSeason();
  const palette = COLORS[season];
  const op = OPACITY[season];

  return (
    <>
      <style>{`
        @keyframes fall-A {
          0%   { transform: translateY(-70px) translateX(0px)   rotate(-15deg); opacity: 0; }
          8%   { opacity: ${op}; }
          88%  { opacity: ${op * 0.75}; }
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
      `}</style>

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
        {LEAVES.map((leaf, i) => (
          /* Contenedor de posición y escala (estático) */
          <div
            key={leaf.id}
            style={{
              position: "absolute",
              left: `${leaf.x}%`,
              top: 0,
              transform: `scale(${leaf.s})`,
              transformOrigin: "top left",
            }}
          >
            {/* Div animado: solo mueve/rota */}
            <div style={{ animation: `fall-${leaf.v} ${leaf.dur}s ease-in ${leaf.delay}s infinite` }}>
              <LeafPath fill={palette[i % palette.length]} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
