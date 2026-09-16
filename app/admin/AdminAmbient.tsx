"use client";

import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

const KEYFRAMES = `
  @keyframes adminBlobA { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-34px, 24px) scale(1.12); } }
  @keyframes adminBlobB { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px, -26px) scale(1.1); } }
  @keyframes adminAurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes adminBokehA { 0% { transform: translateY(0); opacity: 0; } 15%, 85% { opacity: 1; } 100% { transform: translateY(-70vh); opacity: 0; } }
  @keyframes adminBokehB { 0% { transform: translateY(0); opacity: 0; } 15%, 85% { opacity: 1; } 100% { transform: translateY(-85vh); opacity: 0; } }
`;

export default function AdminAmbient({ fondo, children }: { fondo: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const { dark } = useThemeStore();

  // Estas pantallas ya tienen su propio fondo completo (login, cambiar clave, chat de pedidos).
  const sinAmbient = pathname === "/admin/login" || pathname === "/admin/password" || pathname?.startsWith("/admin/pedidos");
  if (sinAmbient) return <>{children}</>;

  const base = dark ? "#160f13" : "#f5eeec";

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: base }}>
      <style>{`
        ${KEYFRAMES}
        .admin-ambient-grain::before {
          content: "";
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          opacity: ${dark ? 0.05 : 0.03};
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="admin-ambient-grain" />
      <AmbientEffect fondo={fondo} dark={dark} />

      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

function AmbientEffect({ fondo, dark }: { fondo: string | null; dark: boolean }) {
  const wrap: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
  };

  switch (fondo) {
    case "malla":
      return (
        <div style={wrap}>
          <div style={{ position: "absolute", top: "-10%", right: "-8%", width: 560, height: 560, borderRadius: "50%", filter: "blur(20px)", background: `radial-gradient(circle, rgba(216,167,177,${dark ? 0.22 : 0.32}) 0%, transparent 65%)`, animation: "adminBlobA 16s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-12%", left: "-6%", width: 420, height: 420, borderRadius: "50%", filter: "blur(20px)", background: `radial-gradient(circle, rgba(139,111,111,${dark ? 0.18 : 0.22}) 0%, transparent 65%)`, animation: "adminBlobB 20s ease-in-out infinite" }} />
        </div>
      );

    case "aurora":
      return (
        <div style={{ ...wrap, background: dark
          ? "linear-gradient(120deg, #1C1917 0%, #241a1d 25%, #2a1e22 50%, #241a1d 75%, #1C1917 100%)"
          : "linear-gradient(120deg, #FBFAF8 0%, #F0DCE0 25%, #E8C6CC 50%, #F4E8E5 75%, #FBFAF8 100%)",
          backgroundSize: "300% 300%", animation: "adminAurora 16s ease infinite", opacity: dark ? 0.7 : 1 }} />
      );

    case "lujo":
      return (
        <div style={{ ...wrap, background: "#1C1917" }}>
          <div style={{ position: "absolute", top: "-12%", right: "-6%", width: 560, height: 560, borderRadius: "50%", filter: "blur(20px)", background: "radial-gradient(circle, rgba(198,138,149,0.30) 0%, transparent 60%)", animation: "adminBlobA 16s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "-14%", left: "-6%", width: 420, height: 420, borderRadius: "50%", filter: "blur(20px)", background: "radial-gradient(circle, rgba(212,175,110,0.22) 0%, transparent 60%)", animation: "adminBlobB 20s ease-in-out infinite" }} />
        </div>
      );

    case "botanico":
      return (
        <div style={{
          ...wrap, opacity: dark ? 0.16 : 0.5,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40,8 C50,5 62,15 63,28 C64,40 55,52 45,58 C42,60 37,60 34,57 C26,51 22,40 25,29 C27,18 33,10 40,8 Z' fill='%235B7E64' opacity='0.12'/%3E%3C/svg%3E\")",
          backgroundSize: "80px 80px",
        }} />
      );

    case "terracota":
      return (
        <div style={{ ...wrap, background: dark
          ? "linear-gradient(160deg, #241a15 0%, #2c2018 45%, #3a2818 100%)"
          : "linear-gradient(160deg, #F4E4D4 0%, #E8C9A8 45%, #D9A87E 100%)", opacity: dark ? 0.6 : 0.55 }} />
      );

    case "ondas":
      return (
        <div style={{
          ...wrap, opacity: dark ? 0.5 : 1,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 140' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C300,140 900,0 1200,80 L1200,140 L0,140 Z' fill='%23C68A95' opacity='0.10'/%3E%3Cpath d='M0,90 C300,40 900,140 1200,60 L1200,140 L0,140 Z' fill='%238B6F6F' opacity='0.08'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat", backgroundPosition: "bottom center", backgroundSize: "100% 140px",
        }} />
      );

    case "bokeh":
      return (
        <div style={wrap}>
          <div aria-hidden style={{
            position: "absolute", bottom: "6%", left: "10%", width: 16, height: 16, borderRadius: "50%", filter: "blur(2.5px)",
            boxShadow: `50px 40px 0 -2px rgba(198,138,149,${dark ? 0.5 : 0.62}), 170px 180px 0 3px rgba(212,175,110,${dark ? 0.42 : 0.52}), 270px 20px 0 -4px rgba(198,138,149,${dark ? 0.36 : 0.46}), 360px 200px 0 1px rgba(216,167,177,${dark ? 0.46 : 0.58})`,
            animation: "adminBokehA 17s ease-in-out infinite",
          }} />
          <div aria-hidden style={{
            position: "absolute", bottom: "4%", right: "8%", width: 16, height: 16, borderRadius: "50%", filter: "blur(2.5px)",
            boxShadow: `-70px 60px 0 0px rgba(212,175,110,${dark ? 0.42 : 0.52}), -190px 150px 0 -3px rgba(198,138,149,${dark ? 0.36 : 0.46}), -30px 240px 0 4px rgba(216,167,177,${dark ? 0.44 : 0.55})`,
            animation: "adminBokehB 21s ease-in-out infinite 3s",
          }} />
        </div>
      );

    case "grano":
      return (
        <div style={{
          ...wrap, opacity: dark ? 0.14 : 0.12, mixBlendMode: "overlay",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }} />
      );

    case "minimal":
    default:
      return null;
  }
}
