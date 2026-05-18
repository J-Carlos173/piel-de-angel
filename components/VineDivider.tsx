"use client";

// Chile: hemisferio sur
function getSeason(): "spring" | "summer" | "autumn" | "winter" {
  const m = new Date().getMonth() + 1; // 1-12
  if (m >= 9 && m <= 11) return "spring";
  if (m === 12 || m <= 2) return "summer";
  if (m >= 3 && m <= 5) return "autumn";
  return "winter";
}

const PALETTE = {
  spring: { stem: "#4A6B52", leaf: "#5B7E64", small: "#7FA882", line: "#5B7E64" },
  summer: { stem: "#3D5940", leaf: "#4A6B52", small: "#5B7E64", line: "#4A6B52" },
  autumn: { stem: "#7A4520", leaf: "#B5651D", small: "#CD853F", line: "#8B4513" },
  winter: { stem: "#7A8B98", leaf: "#7A8B98", small: "#9AAAB8", line: "#8A9BA8" },
};

const AUTUMN_LEAVES = [
  { x: 85,  delay: 0,   rot: -15, color: "#C45E1A" },
  { x: 114, delay: 0.9, rot:  22, color: "#B5651D" },
  { x: 100, delay: 1.7, rot:  -6, color: "#CD853F" },
  { x: 92,  delay: 2.5, rot:  34, color: "#A0522D" },
];

export default function VineDivider() {
  const season = getSeason();
  const c = PALETTE[season];

  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 0",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <svg
        viewBox="0 0 220 44"
        width={220}
        height={44}
        style={{ overflow: "visible" }}
      >
        {/* Líneas laterales */}
        <path d="M0,32 Q45,32 88,32"    stroke={c.line} strokeWidth="0.7" fill="none" opacity={0.28} strokeLinecap="round" />
        <path d="M132,32 Q175,32 220,32" stroke={c.line} strokeWidth="0.7" fill="none" opacity={0.28} strokeLinecap="round" />

        {/* Tallo central */}
        <path d="M110,35 C110,27 110,18 110,11" stroke={c.stem} strokeWidth="1.1" fill="none" opacity={0.6} strokeLinecap="round" />

        {/* ── Ornamento superior según estación ── */}

        {/* Primavera: florcita amarilla con pulso suave */}
        {season === "spring" && (
          <g transform="translate(110, 2)" style={{ animation: "bloomPulse 3s ease-in-out infinite" }}>
            <ellipse rx="3.5" ry="5.5" fill="#FFE566" opacity={0.80} transform="rotate(0)"   />
            <ellipse rx="3.5" ry="5.5" fill="#FFEB3B" opacity={0.70} transform="rotate(60)"  />
            <ellipse rx="3.5" ry="5.5" fill="#FFD700" opacity={0.70} transform="rotate(120)" />
            <circle r="2.8" fill="#F59B00" />
          </g>
        )}

        {/* Verano / Otoño: hoja arriba */}
        {(season === "summer" || season === "autumn") && (
          <path d="M110,11 C107,6 107,2 110,0 C113,2 113,6 110,11 Z" fill={c.leaf} opacity={0.55} />
        )}

        {/* Invierno: pequeño nudo sin hoja */}
        {season === "winter" && (
          <circle cx="110" cy="10" r="1.8" fill={c.stem} opacity={0.35} />
        )}

        {/* ── Ramas laterales ── */}

        {season !== "winter" ? (
          <>
            {/* Izquierda */}
            <path d="M110,23 C103,20 96,18 91,17" stroke={c.stem} strokeWidth="0.9" fill="none" opacity={0.52} strokeLinecap="round" />
            <path d="M91,17 C86,12 87,7 89,6 C90,10 91,14 91,17 Z"   fill={c.leaf}  opacity={0.50} />
            {/* Derecha */}
            <path d="M110,23 C117,20 124,18 129,17" stroke={c.stem} strokeWidth="0.9" fill="none" opacity={0.52} strokeLinecap="round" />
            <path d="M129,17 C134,12 133,7 131,6 C130,10 129,14 129,17 Z" fill={c.leaf} opacity={0.50} />
            {/* Hojitas pequeñas en el tallo */}
            <path d="M110,29 C104,26 98,25 95,25 C98,27 104,29 110,29 Z"  fill={c.small} opacity={0.42} />
            <path d="M110,29 C116,26 122,25 125,25 C122,27 116,29 110,29 Z" fill={c.small} opacity={0.42} />
          </>
        ) : (
          /* Invierno: ramas peladas */
          <>
            <path d="M110,23 C103,20 96,18 91,17"  stroke={c.stem} strokeWidth="0.9" fill="none" opacity={0.38} strokeLinecap="round" />
            <path d="M110,23 C117,20 124,18 129,17" stroke={c.stem} strokeWidth="0.9" fill="none" opacity={0.38} strokeLinecap="round" />
          </>
        )}

        {/* ── Otoño: hojas cayendo ── */}
        {season === "autumn" && AUTUMN_LEAVES.map((lf, i) => (
          <g key={i} transform={`translate(${lf.x}, 0)`}>
            <g style={{ animation: `leafFall ${2.5 + i * 0.22}s ease-in ${lf.delay}s infinite` }}>
              <path
                d="M6,0 C3,3 0,7 0,10 C0,13.3 2.7,15 6,15 C9.3,15 12,13.3 12,10 C12,7 9,3 6,0 Z"
                fill={lf.color}
                opacity={0.73}
                transform={`rotate(${lf.rot} 6 8)`}
              />
            </g>
          </g>
        ))}

        {/* ── Invierno: gotitas de lluvia ── */}
        {season === "winter" && (
          <>
            <g transform="translate(88, 17)">
              <g style={{ animation: "waterDrip 2.2s ease-in 0s infinite" }}>
                <path d="M4,0 C2,3 0,5.5 0,7.5 C0,9.8 1.8,11 4,11 C6.2,11 8,9.8 8,7.5 C8,5.5 6,3 4,0 Z" fill="#94B9D4" opacity={0.62} />
              </g>
            </g>
            <g transform="translate(126, 17)">
              <g style={{ animation: "waterDrip 2.2s ease-in 1.1s infinite" }}>
                <path d="M4,0 C2,3 0,5.5 0,7.5 C0,9.8 1.8,11 4,11 C6.2,11 8,9.8 8,7.5 C8,5.5 6,3 4,0 Z" fill="#94B9D4" opacity={0.62} />
              </g>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
