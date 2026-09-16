"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push(next);
    } else {
      setError(data.error || "Contraseña incorrecta");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #fefcfb 0%, #f5ede8 45%, #f0e4ec 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @keyframes loginAuraFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-46px, 34px) scale(1.18); }
        }
        @keyframes loginAuraFloatRev {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.14); }
        }
        .login-grain::before {
          content: "";
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          opacity: 0.035;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .login-card { position: relative; overflow: hidden; }
        .login-card::before {
          content: "";
          position: absolute;
          top: 0; left: -130%;
          width: 60%; height: 100%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          transition: left 0.7s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }
        .login-card:hover::before { left: 130%; }
        .login-btn { position: relative; overflow: hidden; }
        .login-btn::before {
          content: "";
          position: absolute;
          top: 0; left: -130%;
          width: 60%; height: 100%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }
        .login-btn:hover::before { left: 130%; }
      `}</style>

      <div className="login-grain" />

      {/* Aura: circulos de luz animados, mas presentes que en el resto del sitio */}
      <div aria-hidden style={{
        position: "absolute", top: -160, right: -120, width: 480, height: 480, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(198,138,149,0.38) 0%, transparent 68%)",
        filter: "blur(10px)", animation: "loginAuraFloat 11s ease-in-out infinite", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: -180, left: -140, width: 440, height: 440, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,110,0.30) 0%, transparent 68%)",
        filter: "blur(10px)", animation: "loginAuraFloatRev 14s ease-in-out infinite", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", top: "38%", left: "8%", width: 220, height: 220, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(216,167,177,0.30) 0%, transparent 70%)",
        filter: "blur(8px)", animation: "loginAuraFloat 9s ease-in-out infinite reverse", pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: "12%", right: "10%", width: 180, height: 180, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(198,138,149,0.26) 0%, transparent 70%)",
        filter: "blur(8px)", animation: "loginAuraFloatRev 10s ease-in-out infinite", pointerEvents: "none",
      }} />

      {/* Card */}
      <div className="login-card" style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 28,
        padding: "48px 44px 40px",
        width: "100%", maxWidth: 390,
        boxShadow: "0 24px 70px rgba(100,60,70,0.12), 0 0 0 1px rgba(198,138,149,0.18)",
        zIndex: 1,
      }}>
        {/* Stripe superior */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "28px 28px 0 0",
          background: "linear-gradient(90deg, transparent, #D8A7B1, #C68A95, #D8A7B1, transparent)",
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 18 }}>
            <div style={{
              position: "absolute", inset: -10, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(198,138,149,0.20) 0%, transparent 70%)",
            }} />
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 26px rgba(198,138,149,0.42)",
              position: "relative", overflow: "hidden",
            }}>
              <img src="/logo-pa.jpg" alt="Piel de Ángel" style={{ width: 72, height: 72, objectFit: "contain" }} />
            </div>
          </div>

          <p style={{ margin: "0 0 5px", fontSize: 10, color: "#C68A95", letterSpacing: "0.28em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif" }}>
            Piel de Ángel
          </p>
          <h1 style={{ margin: "0 0 5px", fontSize: 26, color: "#2e1e24", fontWeight: 400 }}>
            Panel de administración
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#9a8486", letterSpacing: "0.04em", fontFamily: "Montserrat, sans-serif" }}>
            Acceso exclusivo · Solo staff
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, color: "#C68A95", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 9, fontFamily: "Montserrat, sans-serif" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="••••••••••"
              required
              autoFocus
              style={{
                width: "100%", padding: "13px 16px",
                border: `1.5px solid ${focused ? "#C68A95" : "#ecddd9"}`,
                borderRadius: 12, fontSize: 16, outline: "none",
                fontFamily: "Georgia, serif",
                boxSizing: "border-box", color: "#2e1e24",
                background: focused ? "rgba(198,138,149,0.04)" : "#fefcfb",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: focused ? "0 0 0 4px rgba(198,138,149,0.12)" : "0 2px 6px rgba(0,0,0,0.04)",
                letterSpacing: "0.12em",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #f5c6c6",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              fontSize: 12, color: "#c0392b", fontFamily: "Montserrat, sans-serif",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            style={{
              width: "100%", padding: "14px",
              background: "#C68A95",
              border: "none", borderRadius: 100,
              color: "#fff", fontSize: 13,
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Montserrat, sans-serif", fontWeight: 500,
              letterSpacing: "2px",
              opacity: loading ? 0.75 : 1,
              boxShadow: "0 14px 40px rgba(198,138,149,0.30)",
              transition: "background 0.25s, transform 0.18s, box-shadow 0.18s",
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#2e1e24"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(198,138,149,0.45)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#C68A95"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(198,138,149,0.30)"; }}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Entrando…</>
              : "Entrar"}
          </button>
        </form>

        <p style={{ margin: "26px 0 0", textAlign: "center", fontSize: 10, color: "#c8b8bc", letterSpacing: "0.1em", fontFamily: "Montserrat, sans-serif" }}>
          ✦ &nbsp; Piel de Ángel &nbsp; ✦
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
