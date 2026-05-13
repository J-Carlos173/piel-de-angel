const igImgs = [
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80",
  "https://images.unsplash.com/photo-1610465299993-e6675c9f9efa?w=500&q=80",
  "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=500&q=80",
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
            {igImgs.map((src) => (
              <a
                key={src}
                href="https://www.instagram.com/pieldeangel.cosmetica/"
                target="_blank"
                rel="noopener noreferrer"
                className="ig-item"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Instagram Piel de Ángel" />
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
