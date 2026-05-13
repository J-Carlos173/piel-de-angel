const imgs = [
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80", alt: "Tratamiento facial" },
  { src: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80", alt: "Ritual de bienestar" },
  { src: "https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?w=600&q=80", alt: "Skincare" },
  { src: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=600&q=80", alt: "Lifting de pestañas" },
  { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80", alt: "Productos premium" },
  { src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80", alt: "Limpieza facial" },
  { src: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80", alt: "Tratamientos" },
];

export default function Galeria() {
  return (
    <section className="galeria" id="galeria">
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">Nuestra Galería</span>
          <h2 className="section-title">
            Momentos de <em>belleza</em>
          </h2>
          <p className="section-subtitle">
            Un vistazo a nuestro espacio, tratamientos y los detalles que hacen de
            cada visita una experiencia única.
          </p>
        </div>

        <div className="galeria-grid reveal">
          {imgs.map((img) => (
            <div className="galeria-item" key={img.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
