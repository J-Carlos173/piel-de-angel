import { getSetting } from "@/lib/db";
import { getPublishedServicios } from "@/lib/services-db";
import HeroPhotoCarousel from "./HeroPhotoCarousel";

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
  imageUrl:
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
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
  // Si ningún servicio activo tiene foto, se usa la imagen configurada en Editar Sitio Web.
  let fotos: { src: string; alt: string }[] = [];
  try {
    const servicios = await getPublishedServicios();
    fotos = servicios
      .filter((s) => s.thumbnail && s.en_portada !== false)
      .map((s) => ({ src: s.thumbnail, alt: `${s.title} a domicilio — Piel de Ángel` }));
  } catch {}
  if (fotos.length === 0) fotos = [{ src: c.imageUrl, alt: c.imageAlt }];

  return (
    <section className="hero" id="inicio">
      <div className="container hero-wrapper">
        <div className="hero-content">
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
      </div>
    </section>
  );
}
