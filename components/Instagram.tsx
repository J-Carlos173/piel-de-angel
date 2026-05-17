export default function Instagram() {
  return (
    <section className="instagram">
      <div className="container">
        <div className="ig-cta reveal">
          <i className="fa-brands fa-instagram ig-cta-icon" />
          <h2 className="ig-cta-title">
            Síguenos en <em>Instagram</em>
          </h2>
          <p className="ig-cta-subtitle">
            Resultados reales, tips de skincare y el día a día de Piel de Ángel.
          </p>
          <a
            href="https://www.instagram.com/pieldeangel.cosmetica/"
            target="_blank"
            rel="noopener noreferrer"
            className="ig-cta-btn"
          >
            <i className="fa-brands fa-instagram" /> @pieldeangel.cosmetica
          </a>
        </div>
      </div>
    </section>
  );
}
