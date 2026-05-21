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

      {/* Hoja decorativa superior derecha */}
      <svg aria-hidden style={{ position: "absolute", right: -30, top: -20, opacity: 0.09, width: 240, pointerEvents: "none" }} viewBox="0 0 220 320">
        <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#4A6B52"/>
        <path d="M110,10 C105,80 108,175 108,268" stroke="#2E4D35" strokeWidth="2" fill="none" opacity={0.5}/>
        <path d="M110,50 C140,65 175,60 200,50" stroke="#2E4D35" strokeWidth="1" fill="none" opacity={0.35}/>
        <path d="M106,110 C130,122 160,118 185,108" stroke="#2E4D35" strokeWidth="1" fill="none" opacity={0.35}/>
        <path d="M102,170 C122,180 148,176 168,166" stroke="#2E4D35" strokeWidth="1" fill="none" opacity={0.3}/>
      </svg>

      {/* Hoja inferior izquierda */}
      <svg aria-hidden style={{ position: "absolute", left: -20, bottom: -30, opacity: 0.07, width: 180, pointerEvents: "none", transform: "rotate(-15deg)" }} viewBox="0 0 220 320">
        <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#5B7E64"/>
        <path d="M110,10 C105,80 108,175 108,268" stroke="#2E4D35" strokeWidth="2" fill="none" opacity={0.4}/>
      </svg>

      {/* Ornamento botánico arriba de la card */}
      <div style={{ position: "absolute", top: "calc(50% - 230px)", left: "50%", transform: "translateX(-50%)" }}>
        <svg viewBox="0 0 220 44" width={160} height={32} aria-hidden>
          <path d="M0,32 Q45,32 88,32"    stroke="#5B7E64" strokeWidth="0.7" fill="none" opacity={0.3} strokeLinecap="round" />
          <path d="M132,32 Q175,32 220,32" stroke="#5B7E64" strokeWidth="0.7" fill="none" opacity={0.3} strokeLinecap="round" />
          <path d="M110,35 C110,27 110,18 110,11" stroke="#4A6B52" strokeWidth="1.1" fill="none" opacity={0.55} strokeLinecap="round" />
          <path d="M110,11 C107,6 107,2 110,0 C113,2 113,6 110,11 Z" fill="#5B7E64" opacity={0.5} />
          <path d="M110,23 C103,20 96,18 91,17" stroke="#4A6B52" strokeWidth="0.9" fill="none" opacity={0.48} strokeLinecap="round" />
          <path d="M91,17 C86,12 87,7 89,6 C90,10 91,14 91,17 Z" fill="#5B7E64" opacity={0.45} />
          <path d="M110,23 C117,20 124,18 129,17" stroke="#4A6B52" strokeWidth="0.9" fill="none" opacity={0.48} strokeLinecap="round" />
          <path d="M129,17 C134,12 133,7 131,6 C130,10 129,14 129,17 Z" fill="#5B7E64" opacity={0.45} />
        </svg>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 28,
        padding: "48px 44px 40px",
        width: "100%", maxWidth: 390,
        boxShadow: "0 24px 70px rgba(100,60,70,0.12), 0 0 0 1px rgba(198,138,149,0.18)",
        position: "relative",
      }}>
        {/* Stripe botánica superior */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "28px 28px 0 0",
          background: "linear-gradient(90deg, transparent, #7FA882, #5B7E64, #7FA882, transparent)",
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
            <label style={{ display: "block", fontSize: 10, color: "#7A9E8A", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 9, fontFamily: "Montserrat, sans-serif" }}>
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
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #8B6F6F 0%, #C68A95 55%, #D8A7B1 100%)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: "0.1em",
              opacity: loading ? 0.75 : 1,
              boxShadow: "0 8px 22px rgba(198,138,149,0.38)",
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
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
