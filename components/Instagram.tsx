const igImgs = [
  { src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80", alt: "Tratamiento facial" },
  { src: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=500&q=80", alt: "Ritual de bienestar" },
  { src: "https://images.unsplash.com/photo-1571646034647-52e6ea84b28c?w=500&q=80", alt: "Skincare" },
  { src: "https://images.unsplash.com/photo-1583241800698-9c2e5a4eb31a?w=500&q=80", alt: "Lifting de pestañas" },
  { src: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&q=80", alt: "Productos premium" },
  { src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=500&q=80", alt: "Limpieza facial" },
];

export default function Instagram() {
  return (
    <section className="instagram">
      <div className="container">
        <div className="ig-header reveal">
          <span className="eyebrow">Síguenos en Instagram</span>
          <h2 className="section-title">
            Nuestro día a día en <em>imágenes</em>
          </h2>
          <a
            href="https://www.instagram.com/pieldeangel.cosmetica/"
            target="_blank"
            rel="noopener noreferrer"
            className="ig-handle"
          >
            <i className="fa-brands fa-instagram" /> @pieldeangel.cosmetica
          </a>
        </div>

        <div className="ig-widget-container reveal">
          <div className="ig-grid">
            {igImgs.map(({ src, alt }) => (
              <a
                key={src}
                href="https://www.instagram.com/pieldeangel.cosmetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="ig-item"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} />
                <div className="ig-overlay">
                  <i className="fa-brands fa-instagram" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
