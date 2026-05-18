"use client";

const V1 = "#5B7E64";
const V2 = "#4A6B52";
const V3 = "#7FA882";
const VN = "#2E4D35";

function Leaf({
  x, y, r, s = 1, c = V1, o = 0.42,
}: { x: number; y: number; r: number; s?: number; c?: string; o?: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>
      <path
        d="M0,-34 C16,-27 24,-10 21,7 C18,24 10,35 0,39 C-10,35 -18,24 -21,7 C-24,-10 -16,-27 0,-34 Z"
        fill={c}
      />
      <path d="M0,-34 C1,-4 -1,20 0,39" stroke={VN} strokeWidth="0.9" fill="none" />
      <path d="M0,-12 C10,-7 18,-2 21,1" stroke={VN} strokeWidth="0.5" fill="none" opacity={0.55} />
      <path d="M0,10 C-10,14 -17,14 -21,12" stroke={VN} strokeWidth="0.5" fill="none" opacity={0.55} />
    </g>
  );
}

function Tendril({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x},${y} C${x + 8},${y + 8} ${x + 6},${y + 18} ${x},${y + 20} C${x - 6},${y + 22} ${x - 8},${y + 14} ${x - 2},${y + 10}`}
      stroke={V2}
      strokeWidth="0.8"
      fill="none"
      opacity={0.35}
    />
  );
}

export default function BotanicalVine() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* ── ENREDADERA IZQUIERDA ── */}
      <svg
        viewBox="0 0 130 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", left: -10, top: 0, width: 140, height: "100%" }}
      >
        {/* Tallo principal */}
        <path
          d="M65,0 C80,90 48,185 68,275 C88,365 52,455 72,545 C92,635 56,720 76,810 C96,900 75,900 65,900"
          stroke={V2}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          opacity={0.45}
        />

        <Leaf x={82} y={75}   r={20}  s={1.1} c={V1} o={0.44} />
        <Leaf x={50} y={180}  r={-28} s={0.9} c={V2} o={0.40} />
        <Tendril x={70} y={240} />
        <Leaf x={86} y={295}  r={22}  s={1.2} c={V3} o={0.38} />
        <Leaf x={48} y={390}  r={-25} s={1.0} c={V1} o={0.42} />
        <Tendril x={74} y={450} />
        <Leaf x={90} y={480}  r={18}  s={0.85} c={V2} o={0.40} />
        <Leaf x={46} y={570}  r={-30} s={1.1}  c={V3} o={0.38} />
        <Leaf x={88} y={660}  r={24}  s={0.9}  c={V1} o={0.41} />
        <Tendril x={68} y={720} />
        <Leaf x={50} y={760}  r={-22} s={0.8}  c={V2} o={0.38} />
        <Leaf x={84} y={845}  r={20}  s={1.0}  c={V3} o={0.35} />
      </svg>

      {/* ── ENREDADERA DERECHA (más corta, asimétrica) ── */}
      <svg
        viewBox="0 0 130 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", right: -10, top: "5%", width: 130, height: "80%" }}
      >
        <path
          d="M65,0 C50,110 80,220 58,330 C36,440 72,540 52,650 C32,760 55,860 65,900"
          stroke={V2}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity={0.35}
        />

        <Leaf x={48} y={90}   r={-18} s={1.0} c={V3} o={0.36} />
        <Leaf x={82} y={210}  r={25}  s={0.9} c={V1} o={0.38} />
        <Tendril x={56} y={295} />
        <Leaf x={44} y={380}  r={-22} s={1.1} c={V2} o={0.34} />
        <Leaf x={78} y={490}  r={20}  s={0.85} c={V3} o={0.36} />
        <Tendril x={52} y={580} />
        <Leaf x={42} y={640}  r={-28} s={0.9}  c={V1} o={0.34} />
        <Leaf x={80} y={750}  r={22}  s={1.0}  c={V2} o={0.32} />
      </svg>

      {/* ── HOJA GRANDE esquina superior derecha ── */}
      <svg
        viewBox="0 0 220 320"
        style={{ position: "absolute", top: -40, right: -50, width: 220, opacity: 0.22, transform: "rotate(18deg)" }}
      >
        <path
          d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z"
          fill={V1}
        />
        <path d="M110,10 C105,80 108,175 108,268" stroke={VN} strokeWidth="2" fill="none" opacity={0.4} />
        <path d="M110,50  C140,65 175,60 200,50"  stroke={VN} strokeWidth="1" fill="none" opacity={0.3} />
        <path d="M106,100 C130,115 160,110 188,100" stroke={VN} strokeWidth="1" fill="none" opacity={0.3} />
        <path d="M102,160 C122,172 148,168 168,158" stroke={VN} strokeWidth="1" fill="none" opacity={0.3} />
        <path d="M100,210 C115,220 132,218 148,210" stroke={VN} strokeWidth="0.8" fill="none" opacity={0.25} />
      </svg>

      {/* ── HOJAS esquina inferior izquierda ── */}
      <svg
        viewBox="0 0 200 260"
        style={{ position: "absolute", bottom: -40, left: -30, width: 190, opacity: 0.20, transform: "rotate(-12deg)" }}
      >
        <path
          d="M80,10 C120,8 168,40 170,88 C172,136 148,200 108,238 C88,256 54,258 36,235 C12,205 8,158 24,105 C40,52 52,12 80,10 Z"
          fill={V2}
        />
        <path d="M80,10 C78,90 82,170 80,238" stroke={VN} strokeWidth="1.8" fill="none" opacity={0.35} />
        <path d="M82,55 C108,68 140,62 165,50" stroke={VN} strokeWidth="0.9" fill="none" opacity={0.28} />
        <path d="M78,120 C100,130 128,125 148,116" stroke={VN} strokeWidth="0.9" fill="none" opacity={0.28} />

        {/* Segunda hoja superpuesta */}
        <path
          d="M30,40 C5,50 -8,90 5,130 C18,168 48,185 70,170 C92,155 96,120 80,88 C64,56 52,32 30,40 Z"
          fill={V3}
          opacity={0.8}
        />
        <path d="M30,40 C42,90 58,130 62,170" stroke={VN} strokeWidth="1" fill="none" opacity={0.3} />
      </svg>
    </div>
  );
}
