"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

type Review = {
  id: string;
  nombre: string;
  texto: string;
  corazones: number;
  estado: "pending" | "approved" | "rejected";
  created_at: string;
};

function Hearts({ n }: { n: number }) {
  return (
    <span>
      {[1,2,3,4,5].map((i) => (
        <i key={i} className={`fa-${i <= n ? "solid" : "regular"} fa-heart`}
          style={{ color: i <= n ? "#C68A95" : "#ccc", fontSize: 13, marginRight: 2 }} />
      ))}
    </span>
  );
}

function fmtFecha(s: string) {
  return new Date(s).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "pending" | "approved";

export default function ReviewsAdminClient() {
  const router = useRouter();
  const { dark, toggle } = useThemeStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("pending");

  const bg       = dark ? "#160f13" : "#f5eeec";
  const cardBg   = dark ? "rgba(42,28,34,0.95)" : "rgba(255,255,255,0.97)";
  const border   = dark ? "#3a2830" : "#ecddd9";
  const textMain = dark ? "#f0dde6" : "#2e1e24";
  const textMuted= dark ? "#9a7c86" : "#9a8486";
  const inputBg  = dark ? "rgba(255,255,255,0.06)" : "#fdf8f7";
  const MONO: React.CSSProperties = { fontFamily: "Montserrat, sans-serif" };

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function aprobar(id: string) {
    setActing(id + "-approve");
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, estado: "approved" }) });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, estado: "approved" } : r));
    setActing(null);
  }

  async function rechazar(id: string) {
    if (!confirm("¿Rechazar y eliminar esta reseña? No se podrá recuperar.")) return;
    setActing(id + "-reject");
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setActing(null);
  }

  async function ocultar(id: string) {
    setActing(id + "-hide");
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, estado: "pending" }) });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, estado: "pending" } : r));
    setActing(null);
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta reseña definitivamente?")) return;
    setActing(id + "-delete");
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setActing(null);
  }

  const pending  = reviews.filter((r) => r.estado === "pending");
  const approved = reviews.filter((r) => r.estado === "approved");
  const visible  = tab === "pending" ? pending : approved;

  const TABS: { key: Tab; label: string; icon: string; count: number; color: string }[] = [
    { key: "pending",  label: "Pendientes", icon: "fa-clock",        count: pending.length,  color: "#e6a817" },
    { key: "approved", label: "Publicadas",  icon: "fa-circle-check", count: approved.length, color: "#66bb6a" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bg, transition: "background 0.3s" }}>

      {/* Header */}
      <div style={{
        background: dark
          ? "linear-gradient(160deg, #1e151a 0%, #1a1218 55%, #1e151a 100%)"
          : "linear-gradient(160deg, #ffffff 0%, #fdf5f7 55%, #f9eef2 100%)",
        padding: "32px 32px 28px", position: "relative", overflow: "hidden",
        borderBottom: dark ? "1.5px solid #3a2830" : "1.5px solid #ecddd9",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #D8A7B1, #C68A95, #D8A7B1, transparent)" }} />
        <svg aria-hidden style={{ position: "absolute", right: 0, top: -8, opacity: dark ? 0.07 : 0.08, width: 150, pointerEvents: "none" }} viewBox="0 0 220 320">
          <path d="M110,10 C155,5 200,35 205,85 C210,135 188,210 150,258 C130,282 90,292 68,270 C38,238 28,185 40,125 C55,58 78,16 110,10 Z" fill="#C68A95"/>
          <path d="M110,10 C105,80 108,175 108,268" stroke="#8B6F6F" strokeWidth="2" fill="none" opacity={0.4}/>
        </svg>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "relative" }}>
          <div>
            <button onClick={() => router.push("/admin")} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 8, padding: "5px 12px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 12, cursor: "pointer", marginBottom: 10, ...MONO, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-arrow-left" /> Panel
            </button>
            <p style={{ margin: 0, color: dark ? "#9a7c86" : "#b08090", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", ...MONO }}>Gestión de Reseñas</p>
            <h1 style={{ margin: "6px 0 2px", color: dark ? "#f0dde6" : "#2e1e24", fontSize: 26, fontWeight: "normal", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Reseñas</h1>
          </div>
          <button onClick={toggle} style={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(198,138,149,0.08)", border: `1.5px solid ${dark ? "#3a2830" : "#ecddd9"}`, borderRadius: 12, padding: "9px 13px", color: dark ? "#c8a8b4" : "#C68A95", fontSize: 15, cursor: "pointer" }}>
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "9px 20px", borderRadius: 12, fontSize: 13, cursor: "pointer", ...MONO,
              border: `1.5px solid ${tab === t.key ? t.color : border}`,
              background: tab === t.key ? `${t.color}18` : inputBg,
              color: tab === t.key ? t.color : textMuted,
              fontWeight: tab === t.key ? 700 : 400,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <i className={`fa-solid ${t.icon}`} style={{ fontSize: 12 }} />
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Aviso pendientes */}
        {tab === "pending" && pending.length > 0 && (
          <div style={{ background: dark ? "rgba(230,168,23,0.1)" : "rgba(230,168,23,0.08)", border: "1.5px solid rgba(230,168,23,0.3)", borderRadius: 14, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, ...MONO, fontSize: 13, color: "#e6a817" }}>
            <i className="fa-solid fa-bell" />
            {pending.length} reseña{pending.length > 1 ? "s" : ""} esperando tu aprobación para publicarse en el sitio.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted, ...MONO }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, display: "block", marginBottom: 12 }} />
            Cargando reseñas...
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: textMuted }}>
            <i className="fa-regular fa-heart" style={{ fontSize: 36, display: "block", marginBottom: 14, opacity: 0.3 }} />
            <p style={{ ...MONO, fontSize: 13 }}>
              {tab === "pending" ? "No hay reseñas pendientes" : "No hay reseñas publicadas aún"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {visible.map((r) => (
              <div key={r.id} style={{ background: cardBg, border: `1.5px solid ${border}`, borderRadius: 18, padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 16, color: textMain, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{r.nombre}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Hearts n={r.corazones} />
                      <span style={{ fontSize: 11, color: textMuted, ...MONO }}>{fmtFecha(r.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {r.estado !== "approved" && (
                      <button
                        onClick={() => aprobar(r.id)}
                        disabled={acting === r.id + "-approve"}
                        style={{ border: "1.5px solid #66bb6a", borderRadius: 10, padding: "7px 16px", background: dark ? "rgba(102,187,106,0.12)" : "rgba(102,187,106,0.08)", color: "#66bb6a", fontSize: 12, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 6 }}
                      >
                        {acting === r.id + "-approve" ? <i className="fa-solid fa-spinner fa-spin" /> : <><i className="fa-solid fa-check" /> Publicar</>}
                      </button>
                    )}
                    {r.estado === "approved" && (
                      <button
                        onClick={() => ocultar(r.id)}
                        disabled={acting === r.id + "-hide"}
                        style={{ border: `1.5px solid ${border}`, borderRadius: 10, padding: "7px 16px", background: "transparent", color: textMuted, fontSize: 12, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 6 }}
                      >
                        {acting === r.id + "-hide" ? <i className="fa-solid fa-spinner fa-spin" /> : <><i className="fa-solid fa-eye-slash" /> Ocultar</>}
                      </button>
                    )}
                    {r.estado === "pending" && (
                      <button
                        onClick={() => rechazar(r.id)}
                        disabled={acting === r.id + "-reject"}
                        style={{ border: `1.5px solid ${border}`, borderRadius: 10, padding: "7px 16px", background: "transparent", color: textMuted, fontSize: 12, cursor: "pointer", ...MONO, display: "flex", alignItems: "center", gap: 6 }}
                      >
                        {acting === r.id + "-reject" ? <i className="fa-solid fa-spinner fa-spin" /> : <><i className="fa-solid fa-ban" /> Rechazar</>}
                      </button>
                    )}
                    <button
                      onClick={() => eliminar(r.id)}
                      disabled={acting === r.id + "-delete"}
                      style={{ border: "1.5px solid #e57373", borderRadius: 10, padding: "7px 12px", background: "transparent", color: "#e57373", fontSize: 12, cursor: "pointer", ...MONO }}
                    >
                      {acting === r.id + "-delete" ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-trash" />}
                    </button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: textMain, lineHeight: 1.6, fontStyle: "italic", borderLeft: `3px solid rgba(198,138,149,0.3)`, paddingLeft: 14 }}>
                  &ldquo;{r.texto}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
