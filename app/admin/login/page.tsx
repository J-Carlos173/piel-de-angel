"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin/ordenes";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #8B6F6F 0%, #C68A95 60%, #D8A7B1 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #D8A7B1, #C68A95)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fa-solid fa-lock" style={{ color: "#fff", fontSize: 24 }} />
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 22, color: "#333", fontWeight: "normal" }}>Panel de Administración</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>Piel de Ángel · Acceso interno</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              autoFocus
              style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #e8d5cc", borderRadius: 10, fontSize: 15, outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", color: "#333" }}
            />
          </div>

          {error && (
            <div style={{ background: "#ffe4e4", border: "1px solid #f5c6c6", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c0392b" }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} />{error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #C68A95, #D8A7B1)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Entrando…</> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
