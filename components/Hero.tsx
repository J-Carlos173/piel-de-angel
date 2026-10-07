import { getSetting } from "@/lib/db";
import { getPublishedServicios } from "@/lib/services-db";
import HeroPhotoCarousel from "./HeroPhotoCarousel";
import { ciberdayActivo, ciberdayDiasRestantes } from "@/lib/ciberday";

type HeroContent = {
  eyebrow: string;
  titleLine1: string;
  titleItalic: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  badgeTitle: string;
  badgeSubtitle: string;
};

const DEFAULTS: HeroContent = {
  eyebrow: "Clínica Estética Premium",
  titleLine1: "Realza tu",
  titleItalic: "belleza natural",
  subtitle:
    "Tratamientos faciales personalizados, skincare profesional y momentos de bienestar diseñados para revelar la mejor versión de tu piel. Una experiencia delicada, segura y profundamente transformadora.",
  imageUrl: "",
  imageAlt: "Tratamiento facial Piel de Ángel",
  badgeTitle: "Atención Premium",
  badgeSubtitle: "Cada piel es única",
};

export default async function Hero() {
  let c = DEFAULTS;
  try {
    const raw = await getSetting("content_hero");
    if (raw) c = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}

  // Rota entre las fotos de los servicios activos en vez de mostrar una sola cara fija.
  // Si ningún servicio está en portada, se usa la imagen de Editar Sitio Web (si hay una); si no hay ninguna, la portada va sin imagen.
  let fotos: { src: string; alt: string }[] = [];
  try {
    const servicios = await getPublishedServicios();
    fotos = servicios
      .filter((s) => s.thumbnail && s.en_portada !== false)
      .map((s) => ({ src: s.thumbnail, alt: `${s.title} a domicilio — Piel de Ángel` }));
  } catch {}
  if (fotos.length === 0 && c.imageUrl) fotos = [{ src: c.imageUrl, alt: c.imageAlt }];
  const sinImagen = fotos.length === 0;

  return (
    <section className={`hero${sinImagen ? " hero-sin-imagen" : ""}`} id="inicio">
      <div className="container hero-wrapper">
        <div className="hero-content">
          {ciberdayActivo() && (
            <a href="/ciberday" className="ciber-hero-banner">
              <span>✦ Ciberday</span> Protectores solares −30% y ojos y pestañas −20%
              <small>Quedan {ciberdayDiasRestantes()} {ciberdayDiasRestantes() === 1 ? "día" : "días"} · Ver ofertas →</small>
            </a>
          )}
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 className="hero-title">
            {c.titleLine1}
            <em>{c.titleItalic}</em>
          </h1>
          <p className="hero-subtitle">{c.subtitle}</p>
          <div className="hero-buttons">
            <a href="#productos" className="btn-primary">
              <i className="fa-solid fa-bag-shopping" /> Tienda
            </a>
            <a href="#servicios" className="btn-secondary">
              Ver Servicios <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </div>

        {!sinImagen && (
        <div className="hero-image">
          <div className="hero-image-wrap">
            <HeroPhotoCarousel fotos={fotos} />
          </div>
          <div className="hero-badge">
            <div className="hero-badge-icon">
              <i className="fa-solid fa-star" />
            </div>
            <div className="hero-badge-text">
              <strong>{c.badgeTitle}</strong>
              <span>{c.badgeSubtitle}</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
