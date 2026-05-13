export default function About() {
  return (
    <section className="about" id="nosotros">
      <div className="container about-wrapper">
        <div className="about-images reveal">
          <div className="about-deco" />
          <div className="about-img-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=700&q=80"
              alt="Centro estético"
            />
          </div>
          <div className="about-img-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80"
              alt="Productos skincare"
            />
          </div>
        </div>

        <div className="about-content reveal">
          <span className="eyebrow">Sobre Nosotros</span>
          <h2 className="section-title">
            Un refugio para tu <em>piel</em>
          </h2>
          <p>
            En Piel de Ángel creemos que la belleza nace del cuidado consciente y del
            bienestar interior. Nuestro espacio fue diseñado como un santuario donde
            cada detalle —la luz, los aromas, las texturas— se une para acompañarte
            en una experiencia única.
          </p>
          <p>
            Trabajamos con tecnología de vanguardia y productos premium, siempre
            guiadas por un enfoque cálido, profesional y profundamente humano. Tu
            piel merece manos expertas y un trato delicado.
          </p>

          <div className="about-features">
            {[
              { icon: "fa-heart", title: "Cuidado Personal", desc: "Atención adaptada a cada piel" },
              { icon: "fa-leaf", title: "Productos Premium", desc: "Cosmética de alta gama" },
              { icon: "fa-spa", title: "Ambiente Spa", desc: "Bienestar y relajación total" },
              { icon: "fa-award", title: "Experiencia", desc: "Profesionales certificadas" },
            ].map(({ icon, title, desc }) => (
              <div className="feature-item" key={title}>
                <div className="feature-icon">
                  <i className={`fa-solid ${icon}`} />
                </div>
                <div className="feature-text">
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
