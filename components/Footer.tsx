export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              Piel de <span>Ángel</span>
            </div>
            <p className="footer-desc">
              Un refugio de bienestar y belleza donde cada detalle está pensado para
              realzar lo más natural de ti.
            </p>
            <div className="footer-redes">
              <a
                href="https://www.instagram.com/pieldeangel.cosmetica/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram" />
              </a>
              <a href="#">
                <i className="fa-brands fa-facebook-f" />
              </a>
              <a href="#">
                <i className="fa-brands fa-tiktok" />
              </a>
              <a
                href="https://wa.me/56977031461"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp" />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navegación</h4>
            <ul>
              {[
                ["#inicio", "Inicio"],
                ["#nosotros", "Nosotros"],
                ["#servicios", "Servicios"],
                ["#productos", "Tienda"],
                ["#promociones", "Promos"],
                ["#agenda", "Agenda"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Servicios</h4>
            <ul>
              {[
                "Limpieza Facial",
                "Lifting de Pestañas",
                "Hidratación Facial",
                "Tratamientos Faciales",
                "Skincare Premium",
              ].map((s) => (
                <li key={s}>
                  <a href="#servicios">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li>
                <i className="fa-solid fa-location-dot" /> &nbsp; Santiago, Chile
              </li>
              <li>
                <i className="fa-brands fa-whatsapp" /> &nbsp; +56 9 7703 1461
              </li>
              <li>
                <i className="fa-solid fa-envelope" /> &nbsp; pieldeangel.contacto@gmail.com
              </li>
              <li>
                <i className="fa-solid fa-clock" /> &nbsp; Lun — Sáb · 10—20h
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Piel de Ángel · Diseñado con <span>♡</span> para realzar tu
          belleza natural
          <a href="/admin/login" className="footer-admin-link">
            <i className="fa-solid fa-lock" /> Staff
          </a>
        </div>
      </div>
    </footer>
  );
}
