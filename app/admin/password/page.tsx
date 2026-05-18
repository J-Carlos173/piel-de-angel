"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    if (next !== confirm) { setError("Las contraseñas nuevas no coinciden"); return; }
    if (next.length < 6) { setError("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    if (data.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Error al cambiar contraseña");
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px",
    border: "1.5px solid #ECD8DC", borderRadius: 12,
    fontSize: 15, outline: "none", fontFamily: "Georgia, serif",
    boxSizing: "border-box", color: "#3A2A2E", background: "#FEFCFC",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #5C3D47 0%, #8B5E6A 30%, #C68A95 68%, #E2B4BC 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ background: "rgba(255,255,255,0.93)", backdropFilter: "blur(24px)", borderRadius: 28, padding: "48px 44px 44px", width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(70,35,45,0.32)", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 3, background: "linear-gradient(90deg, transparent, #C68A95, #E8C0C8, #C68A95, transparent)", borderRadius: "0 0 6px 6px" }} />

        <button onClick={() => router.push("/admin")} style={{ background: "none", border: "none", cursor: "pointer", color: "#C68A95", fontSize: 13, fontFamily: "Georgia, serif", marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <i className="fa-solid fa-arrow-left" /> Volver al panel
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(145deg, #D8A7B1, #C68A95, #8B6F6F)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(198,138,149,0.45)" }}>
            <i className="fa-solid fa-key" style={{ color: "#fff", fontSize: 22 }} />
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "#C68A95", letterSpacing: "0.25em", textTransform: "uppercase" }}>Panel · Piel de Ángel</p>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, color: "#3A2A2E", fontWeight: 400, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Cambiar contraseña</h1>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: 48, color: "#4caf50", marginBottom: 16, display: "block" }} />
            <p style={{ fontSize: 16, color: "#3A2A2E", margin: "0 0 8px" }}>¡Contraseña actualizada!</p>
            <p style={{ fontSize: 13, color: "#BBA8AB", margin: "0 0 24px" }}>La próxima vez que inicies sesión usa la nueva contraseña.</p>
            <button onClick={() => router.push("/admin")} style={{ background: "linear-gradient(135deg, #8B6F6F, #C68A95, #D8A7B1)", border: "none", borderRadius: 12, padding: "12px 28px", color: "#fff", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", boxShadow: "0 8px 24px rgba(198,138,149,0.4)" }}>
              Ir al panel
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Contraseña actual", value: current, onChange: setCurrent },
              { label: "Nueva contraseña", value: next, onChange: setNext },
              { label: "Confirmar nueva contraseña", value: confirm, onChange: setConfirm },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 11, color: "#9B8690", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>{label}</label>
                <input type="password" value={value} onChange={(e) => onChange(e.target.value)} required style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#C68A95"; e.target.style.boxShadow = "0 0 0 4px rgba(198,138,149,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#ECD8DC"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: "#fff0f0", border: "1px solid #f5c6c6", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#c0392b", display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fa-solid fa-circle-exclamation" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: "14px", background: "linear-gradient(135deg, #8B6F6F, #C68A95, #D8A7B1)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", boxShadow: "0 8px 24px rgba(198,138,149,0.4)", opacity: loading ? 0.75 : 1, letterSpacing: "0.06em" }}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Guardando…</> : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
