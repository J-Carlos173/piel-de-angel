"use client";

import { useEffect, useState } from "react";

type Review = { id: string; nombre: string; texto: string; corazones: number };

const FALLBACK: Review[] = [
  { id: "1", corazones: 5, texto: "Un lugar mágico. Salí con la piel renovada y sintiéndome cuidada de verdad. La atención es impecable y los resultados se notaron desde la primera sesión.", nombre: "Camila R." },
  { id: "2", corazones: 5, texto: "El lifting de pestañas quedó perfecto, totalmente natural. El espacio es precioso, te transporta. Volveré sin duda, encontré mi lugar.", nombre: "Valentina S." },
  { id: "3", corazones: 5, texto: "Profesionalismo de otro nivel. Me explicaron cada paso y eligieron el tratamiento ideal para mi piel. La hidratación facial fue una experiencia espectacular.", nombre: "Antonia P." },
];

function Hearts({ n, interactive, onSelect }: { n: number; interactive?: boolean; onSelect?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || n;
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {[1,2,3,4,5].map((i) => (
        <i
          key={i}
          className={`fa-${i <= active ? "solid" : "regular"} fa-heart`}
          style={{
            color: i <= active ? "#C68A95" : "#d4b8be",
            fontSize: interactive ? 24 : 14,
            cursor: interactive ? "pointer" : "default",
            transition: "transform 0.12s",
            transform: interactive && i <= active ? "scale(1.2)" : "scale(1)",
          }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onSelect?.(i)}
        />
      ))}
    </span>
  );
}

export default function Testimonios() {
  const [reviews, setReviews]     = useState<Review[]>(FALLBACK);
  const [showForm, setShowForm]   = useState(false);
  const [nombre, setNombre]       = useState("");
  const [texto, setTexto]         = useState("");
  const [corazones, setCorazones] = useState(5);
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => { if (d.reviews?.length > 0) setReviews(d.reviews); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !texto.trim()) { setError("Completa tu nombre y reseña."); return; }
    if (texto.trim().length < 10) { setError("Escribe un poco más sobre tu experiencia."); return; }
    setSending(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), texto: texto.trim(), corazones }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al enviar."); return; }
      setSent(true);
      setNombre(""); setTexto(""); setCorazones(5);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  const LABELS = ["", "Regular", "Bien", "Bueno", "Muy bueno", "¡Increíble!"];

  return (
    <section className="testimonios" id="testimonios">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">Testimonios</span>
          <h2 className="section-title">
            Lo que dicen nuestras <em>clientas</em>
          </h2>
          <p className="section-subtitle">
            La confianza que depositan en nosotras es nuestro mayor logro. Estas son
            algunas de sus experiencias.
          </p>
        </div>

        <div className="testimonios-grid">
          {reviews.map((r) => (
            <div className="testimonio-card reveal" key={r.id}>
              <div className="testimonio-quote">&quot;</div>
              <div className="testimonio-stars">
                <Hearts n={r.corazones} />
              </div>
              <p className="testimonio-text">{r.texto}</p>
              <div className="testimonio-author">
                <div className="testimonio-avatar" style={{ background: "linear-gradient(135deg, #D8A7B1, #C68A95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-user" style={{ color: "#fff", fontSize: 18 }} />
                </div>
                <div>
                  <div className="testimonio-name">{r.nombre}</div>
                  <div className="testimonio-role">Clienta Piel de Ángel</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA + formulario */}
        <div className="reveal" style={{ textAlign: "center", marginTop: 48 }}>

          {!showForm && !sent && (
            <button
              onClick={() => setShowForm(true)}
              style={{ background: "linear-gradient(135deg, #C68A95, #8B6F6F)", border: "none", borderRadius: 50, padding: "14px 34px", color: "#fff", fontSize: 15, cursor: "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.06em", boxShadow: "0 8px 28px rgba(198,138,149,0.35)", display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              <i className="fa-regular fa-heart" /> ¿Fuiste clienta? Deja tu reseña
            </button>
          )}

          {showForm && !sent && (
            <div style={{ maxWidth: 540, margin: "0 auto", background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: "36px 32px", boxShadow: "0 16px 60px rgba(198,138,149,0.18)", border: "1.5px solid rgba(198,138,149,0.2)", textAlign: "left" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: "normal", color: "#2e1e24", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Tu experiencia importa</h3>
              <p style={{ margin: "0 0 26px", fontSize: 13, color: "#9a8486", fontFamily: "Montserrat, sans-serif" }}>Tu reseña será revisada antes de publicarse.</p>

              <form onSubmit={handleSubmit}>
                {/* Corazones */}
                <div style={{ marginBottom: 24, textAlign: "center" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 11, color: "#9a8486", fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: "0.12em" }}>Tu valoración</p>
                  <Hearts n={corazones} interactive onSelect={setCorazones} />
                  <p style={{ margin: "10px 0 0", fontSize: 13, color: "#C68A95", fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>{LABELS[corazones]}</p>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#7A9E8A", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7, fontFamily: "Montserrat, sans-serif" }}>Tu nombre</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Camila R." maxLength={80}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #ecddd9", borderRadius: 12, fontSize: 14, fontFamily: "Georgia, serif", color: "#2e1e24", outline: "none", boxSizing: "border-box", background: "#fefcfb" }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, color: "#7A9E8A", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 7, fontFamily: "Montserrat, sans-serif" }}>Tu reseña</label>
                  <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Cuéntanos sobre tu experiencia en Piel de Ángel..." rows={4} maxLength={500}
                    style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #ecddd9", borderRadius: 12, fontSize: 14, fontFamily: "Georgia, serif", color: "#2e1e24", outline: "none", resize: "vertical", boxSizing: "border-box", background: "#fefcfb" }} />
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "#c0b0b5", fontFamily: "Montserrat, sans-serif", textAlign: "right" }}>{texto.length}/500</p>
                </div>

                {error && (
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: "#e57373", fontFamily: "Montserrat, sans-serif" }}>
                    <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 6 }} />{error}
                  </p>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                    style={{ flex: 1, padding: "12px", border: "1.5px solid #ecddd9", borderRadius: 12, background: "transparent", color: "#9a8486", fontSize: 13, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={sending}
                    style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #C68A95, #8B6F6F)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, cursor: sending ? "wait" : "pointer", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {sending ? <><i className="fa-solid fa-spinner fa-spin" /> Enviando...</> : <><i className="fa-solid fa-heart" /> Enviar reseña</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {sent && (
            <div style={{ maxWidth: 400, margin: "0 auto", background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: "40px 28px", boxShadow: "0 16px 60px rgba(198,138,149,0.18)", border: "1.5px solid rgba(198,138,149,0.2)", textAlign: "center" }}>
              <i className="fa-solid fa-heart" style={{ fontSize: 40, color: "#C68A95", display: "block", marginBottom: 16 }} />
              <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: "normal", color: "#2e1e24", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>¡Gracias por tu reseña!</h3>
              <p style={{ margin: "0 0 22px", fontSize: 14, color: "#9a8486", fontFamily: "Montserrat, sans-serif", lineHeight: 1.6 }}>
                Será revisada y publicada muy pronto. Tu opinión es muy valiosa para nosotras. 🌸
              </p>
              <button onClick={() => { setSent(false); setShowForm(false); }}
                style={{ padding: "10px 28px", border: "1.5px solid #ecddd9", borderRadius: 50, background: "transparent", color: "#C68A95", fontSize: 13, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
