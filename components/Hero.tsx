export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container hero-wrapper">
        <div className="hero-content">
          <span className="eyebrow">Clínica Estética Premium</span>
          <h1 className="hero-title">
            Realza tu
            <em>belleza natural</em>
          </h1>
          <p className="hero-subtitle">
            Tratamientos faciales personalizados, skincare profesional y momentos de
            bienestar diseñados para revelar la mejor versión de tu piel. Una
            experiencia delicada, segura y profundamente transformadora.
          </p>
          <div className="hero-buttons">
            <a href="#contacto" className="btn-primary">
              <i className="fa-regular fa-calendar" /> Reservar Hora
            </a>
            <a href="#servicios" className="btn-secondary">
              Ver Servicios <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80"
              alt="Tratamiento facial Piel de Ángel"
            />
          </div>
          <div className="hero-badge">
            <div className="hero-badge-icon">
              <i className="fa-solid fa-star" />
            </div>
            <div className="hero-badge-text">
              <strong>+500 Clientas</strong>
              <span>Felices y radiantes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
