const testimonios = [
  {
    texto: "Un lugar mágico. Salí con la piel renovada y sintiéndome cuidada de verdad. La atención es impecable y los resultados se notaron desde la primera sesión.",
    nombre: "Camila Rojas",
    rol: "Cliente desde 2024",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    texto: "El lifting de pestañas quedó perfecto, totalmente natural. El espacio es precioso, te transporta. Volveré sin duda, encontré mi lugar.",
    nombre: "Valentina Soto",
    rol: "Cliente desde 2023",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
  {
    texto: "Profesionalismo de otro nivel. Me explicaron cada paso y eligieron el tratamiento ideal para mi piel. La hidratación facial fue una experiencia espectacular.",
    nombre: "Antonia Pérez",
    rol: "Cliente desde 2024",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
];

export default function Testimonios() {
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
          {testimonios.map((t) => (
            <div className="testimonio-card reveal" key={t.nombre}>
              <div className="testimonio-quote">&quot;</div>
              <div className="testimonio-stars">★ ★ ★ ★ ★</div>
              <p className="testimonio-text">{t.texto}</p>
              <div className="testimonio-author">
                <div className="testimonio-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.nombre} />
                </div>
                <div>
                  <div className="testimonio-name">{t.nombre}</div>
                  <div className="testimonio-role">{t.rol}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
