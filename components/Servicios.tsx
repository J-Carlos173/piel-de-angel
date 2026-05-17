const servicios = [
  {
    img: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
    title: "Limpieza Facial",
    desc: "Una purificación profunda que elimina impurezas y devuelve frescura, luminosidad y suavidad a tu rostro.",
  },
  {
    img: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=600&q=80",
    title: "Lifting de Pestañas",
    desc: "Realza tu mirada con un efecto curvado natural y duradero. Sin extensiones, sin mantenimiento diario.",
  },
  {
    img: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
    title: "Hidratación Facial",
    desc: "Restaura la hidratación profunda de tu piel con activos premium que la dejan radiante, elástica y suave.",
  },
  {
    img: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    title: "Tratamientos Faciales",
    desc: "Protocolos personalizados anti-edad, despigmentantes y revitalizantes para resultados visibles desde la primera sesión.",
  },
  {
    img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
    title: "Skincare Premium",
    desc: "Selección curada de cosmética profesional para que tu rutina en casa potencie los resultados de cada tratamiento.",
  },
  {
    img: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80",
    title: "Ritual de Bienestar",
    desc: "Una experiencia completa de relajación y cuidado: masaje facial, aromaterapia y un mimo de pies a cabeza.",
  },
];

export default function Servicios() {
  return (
    <section className="servicios" id="servicios">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">Nuestros Servicios</span>
          <h2 className="section-title">
            Tratamientos <em>diseñados para ti</em>
          </h2>
          <p className="section-subtitle">
            Cada tratamiento es una experiencia sensorial cuidadosamente curada para
            nutrir, revitalizar y devolverle a tu piel su luminosidad natural.
          </p>
        </div>

        <div className="servicios-grid">
          {servicios.map((s) => (
            <div className="servicio-card reveal" key={s.title}>
              <div className="servicio-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={s.title} />
              </div>
              <div className="servicio-content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <a href="#agenda" className="servicio-btn">
                  Agendar <i className="fa-solid fa-calendar-check" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
