export const dynamic = "force-dynamic";

import { getSetting } from "@/lib/db";
import ContenidoClient from "./ContenidoClient";

const HERO_DEFAULTS = {
  eyebrow: "Clínica Estética Premium",
  titleLine1: "Realza tu",
  titleItalic: "belleza natural",
  subtitle:
    "Tratamientos faciales personalizados, skincare profesional y momentos de bienestar diseñados para revelar la mejor versión de tu piel. Una experiencia delicada, segura y profundamente transformadora.",
  imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
  imageAlt: "Tratamiento facial Piel de Ángel",
  badgeTitle: "Atención Premium",
  badgeSubtitle: "Cada piel es única",
};

const ABOUT_DEFAULTS = {
  eyebrow: "Sobre Nosotros",
  titleLine1: "Un refugio para tu",
  titleItalic: "piel",
  paragraph1:
    "En Piel de Ángel creemos que la belleza nace del cuidado consciente y del bienestar interior. Nuestro espacio fue diseñado como un santuario donde cada detalle —la luz, los aromas, las texturas— se une para acompañarte en una experiencia única.",
  paragraph2:
    "Trabajamos con tecnología de vanguardia y productos premium, siempre guiadas por un enfoque cálido, profesional y profundamente humano. Tu piel merece manos expertas y un trato delicado.",
  image1Url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=700&q=80",
  image2Url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80",
};

export default async function ContenidoPage() {
  const [rawHero, rawAbout] = await Promise.all([
    getSetting("content_hero").catch(() => null),
    getSetting("content_about").catch(() => null),
  ]);

  const hero  = rawHero  ? { ...HERO_DEFAULTS,  ...JSON.parse(rawHero)  } : HERO_DEFAULTS;
  const about = rawAbout ? { ...ABOUT_DEFAULTS, ...JSON.parse(rawAbout) } : ABOUT_DEFAULTS;

  return <ContenidoClient initialHero={hero} initialAbout={about} />;
}
