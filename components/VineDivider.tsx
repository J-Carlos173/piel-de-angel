export default function VineDivider() {
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
      <svg viewBox="0 0 220 44" width={220} height={44} style={{ overflow: "visible" }}>
        {/* Líneas laterales que se desvanecen hacia el centro */}
        <path d="M0,32 Q45,32 88,32"  stroke="#5B7E64" strokeWidth="0.7" fill="none" opacity={0.28} strokeLinecap="round" />
        <path d="M132,32 Q175,32 220,32" stroke="#5B7E64" strokeWidth="0.7" fill="none" opacity={0.28} strokeLinecap="round" />

        {/* Tallo central */}
        <path d="M110,35 C110,27 110,18 110,11" stroke="#4A6B52" strokeWidth="1.1" fill="none" opacity={0.6} strokeLinecap="round" />

        {/* Hoja central apuntando arriba */}
        <path d="M110,11 C107,6 107,2 110,0 C113,2 113,6 110,11 Z" fill="#5B7E64" opacity={0.55} />

        {/* Rama izquierda */}
        <path d="M110,23 C103,20 96,18 91,17" stroke="#4A6B52" strokeWidth="0.9" fill="none" opacity={0.52} strokeLinecap="round" />
        {/* Hoja izquierda */}
        <path d="M91,17 C86,12 87,7 89,6 C90,10 91,14 91,17 Z" fill="#5B7E64" opacity={0.50} />

        {/* Rama derecha */}
        <path d="M110,23 C117,20 124,18 129,17" stroke="#4A6B52" strokeWidth="0.9" fill="none" opacity={0.52} strokeLinecap="round" />
        {/* Hoja derecha */}
        <path d="M129,17 C134,12 133,7 131,6 C130,10 129,14 129,17 Z" fill="#5B7E64" opacity={0.50} />

        {/* Hojitas pequeñas laterales en el tallo */}
        <path d="M110,29 C104,26 98,25 95,25 C98,27 104,29 110,29 Z" fill="#7FA882" opacity={0.42} />
        <path d="M110,29 C116,26 122,25 125,25 C122,27 116,29 110,29 Z" fill="#7FA882" opacity={0.42} />
      </svg>
    </div>
  );
}
