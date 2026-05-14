const PROMOS = [
  {
    tag: "Concurso · Día de la Madre",
    title: "¡Regala belleza este Día de la Madre!",
    description:
      "Sorteamos una Limpieza Facial Profunda y un Lifting de Pestañas. Para participar: síguenos, comenta con 🤍 y etiqueta a esa mamá especial. Mientras más comentarios, más chances.",
    prizes: ["Limpieza facial profunda", "Lifting de pestañas"],
    cta: "Ver publicación",
    href: "https://www.instagram.com/p/DX-fsnigsff",
    finished: true,
  },
];

export default function Promociones() {
  return (
    <section className="promos-section" id="promociones">
      <div className="promos-container">
        <div className="section-header">
          <span className="section-tag">Ofertas & Concursos</span>
          <h2 className="section-title">Promociones</h2>
          <p className="section-subtitle">Síguenos en Instagram para no perderte ninguna novedad</p>
        </div>

        <div className="promos-grid">
          {PROMOS.map((p, i) => (
            <div key={i} className={`promo-card${p.finished ? " finished" : ""}`}>
              {p.finished && <span className="promo-badge-finished">Finalizado</span>}
              <span className="promo-tag">{p.tag}</span>
              <h3 className="promo-title">{p.title}</h3>
              <p className="promo-desc">{p.description}</p>
              <ul className="promo-prizes">
                {p.prizes.map((prize) => (
                  <li key={prize}>
                    <span className="promo-prize-dot">✦</span> {prize}
                  </li>
                ))}
              </ul>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="promo-cta"
              >
                <i className="fa-brands fa-instagram" /> {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
