import { SERVICIOS_LP } from "@/data/servicios-lp";
import { getPublishedServicios } from "@/lib/services-db";

export default async function Footer() {
  // Solo se listan los servicios que Tere tiene activos en Gestión de Servicios.
  let serviciosActivos = SERVICIOS_LP;
  try {
    const publicados = await getPublishedServicios();
    serviciosActivos = SERVICIOS_LP.filter((s) => publicados.some((p) => s.match.test(p.title)));
  } catch {}

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <img src="/logo-pa.jpg" alt="Piel de Ángel" style={{ height: 70, objectFit: "contain", borderRadius: 4 }} />
            </div>
            <p className="footer-desc">
              Conocer tu piel cambia la forma de cuidarla.
            </p>
            <div className="footer-redes">
              <a
                href="https://www.instagram.com/pieldeangel.cosmetica/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram" />
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
                ["/#inicio", "Inicio"],
                ["/tienda", "Tienda"],
                ["/#servicios", "Servicios"],
                ["/#promociones", "Promos"],
                ["/#agenda", "Agenda"],
                ["/#nosotros", "Nosotros"],
                ["/consejos", "Consejos de piel"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {serviciosActivos.length > 0 && (
            <div className="footer-col">
              <h4>Servicios</h4>
              <ul>
                {serviciosActivos.map((s) => (
                  <li key={s.slug}>
                    <a href={`/${s.slug}`}>{s.nombre}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
          <a href="/admin/login" className="footer-admin-link" aria-label="Staff">
            <i className="fa-solid fa-lock" />
          </a>
        </div>
      </div>
    </footer>
  );
}
