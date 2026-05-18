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
  const [hoverBtn, setHoverBtn] = useState(false);

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
      background: "linear-gradient(145deg, #5C3D47 0%, #8B5E6A 30%, #C68A95 65%, #E2B4BC 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      position: "relative", overflow: "hidden",
    }}>

      {/* Orbes decorativos de fondo */}
      <div style={{ position: "absolute", top: "-120px", left: "-120px", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "38%", right: "12%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "20%", left: "18%", width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Card con efecto vidrio */}
      <div style={{
        background: "rgba(255,255,255,0.93)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 28,
        padding: "52px 44px 44px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 32px 80px rgba(70,35,45,0.35), 0 0 0 1px rgba(255,255,255,0.55)",
        position: "relative",
      }}>

        {/* Línea superior brillante */}
        <div style={{
          position: "absolute", top: 0, left: "18%", right: "18%", height: 3,
          background: "linear-gradient(90deg, transparent, #C68A95, #E8C0C8, #C68A95, transparent)",
          borderRadius: "0 0 6px 6px",
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          {/* Icono con halo */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
            <div style={{
              position: "absolute", inset: -8, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(198,138,149,0.25) 0%, transparent 70%)",
            }} />
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(145deg, #D8A7B1 0%, #C68A95 50%, #8B6F6F 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 10px 30px rgba(198,138,149,0.5), inset 0 1px 0 rgba(255,255,255,0.35)",
              position: "relative",
            }}>
              <i className="fa-solid fa-lock" style={{ color: "#fff", fontSize: 26, textShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </div>

          <p style={{ margin: "0 0 6px", fontSize: 11, color: "#C68A95", letterSpacing: "0.28em", textTransform: "uppercase" }}>
            Piel de Ángel
          </p>
          <h1 style={{ margin: "0 0 6px", fontSize: 28, color: "#3A2A2E", fontWeight: 400 }}>
            Acceso privado
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#BBA8AB", letterSpacing: "0.04em" }}>
            Panel interno · Solo staff
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, color: "#9B8690", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>
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
                width: "100%", padding: "14px 16px",
                border: `1.5px solid ${focused ? "#C68A95" : "#ECD8DC"}`,
                borderRadius: 12, fontSize: 16, outline: "none",
                fontFamily: "Georgia, serif",
                boxSizing: "border-box", color: "#3A2A2E",
                background: focused ? "rgba(198,138,149,0.04)" : "#FEFCFC",
                transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
                boxShadow: focused ? "0 0 0 4px rgba(198,138,149,0.15)" : "0 2px 8px rgba(0,0,0,0.04)",
                letterSpacing: "0.12em",
              }}
            />
          </div>

          {error && (
            <div style={{
              background: "linear-gradient(135deg, #ffe8e8, #fff0f0)",
              border: "1px solid #f5c6c6",
              borderRadius: 10, padding: "11px 14px", marginBottom: 18,
              fontSize: 13, color: "#c0392b",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 2px 8px rgba(192,57,43,0.08)",
            }}>
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            style={{
              width: "100%", padding: "15px",
              background: "linear-gradient(135deg, #8B6F6F 0%, #C68A95 55%, #D8A7B1 100%)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              letterSpacing: "0.1em",
              opacity: loading ? 0.75 : 1,
              boxShadow: loading || !hoverBtn
                ? "0 8px 24px rgba(198,138,149,0.4)"
                : "0 14px 36px rgba(198,138,149,0.55)",
              transform: !loading && hoverBtn ? "translateY(-2px)" : "translateY(0)",
              transition: "transform 0.18s, box-shadow 0.18s, opacity 0.2s",
            }}
          >
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Entrando…</>
              : "Entrar"}
          </button>
        </form>

        {/* Pie decorativo */}
        <p style={{ margin: "28px 0 0", textAlign: "center", fontSize: 11, color: "#CCBBBE", letterSpacing: "0.1em" }}>
          ✦ &nbsp; Acceso exclusivo para administradoras &nbsp; ✦
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
