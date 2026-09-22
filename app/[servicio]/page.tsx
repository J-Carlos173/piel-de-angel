import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ServicioLanding from "@/components/ServicioLanding";
import { SERVICIOS_LP } from "@/data/servicios-lp";
import { getServiciosLPOverrides, getZonasDomicilio, mergeServicioLP } from "@/lib/servicios-lp-content";
import { getPublishedServicios } from "@/lib/services-db";

export const revalidate = 3600;
export const dynamicParams = false;

const SITE = "https://www.pieldeangel.cl";

export function generateStaticParams() {
  return SERVICIOS_LP.map((s) => ({ servicio: s.slug }));
}

async function estaPublicado(base: (typeof SERVICIOS_LP)[number]): Promise<boolean> {
  try {
    const publicados = await getPublishedServicios();
    return publicados.some((p) => base.match.test(p.title));
  } catch {
    // Si falla la consulta, se prefiere mostrar la página antes que ocultarla por error.
    return true;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ servicio: string }> }): Promise<Metadata> {
  const { servicio } = await params;
  const base = SERVICIOS_LP.find((x) => x.slug === servicio);
  if (!base || !(await estaPublicado(base))) return { robots: { index: false, follow: true } };
  const overrides = await getServiciosLPOverrides();
  const s = mergeServicioLP(base, overrides[base.slug]);
  const url = `${SITE}/${s.slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url,
      siteName: "Piel de Ángel",
      title: `${s.metaTitle} · Piel de Ángel`,
      description: s.metaDescription,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: `${s.nombre} — Piel de Ángel` }],
    },
  };
}

export default async function ServicioPage({ params }: { params: Promise<{ servicio: string }> }) {
  const { servicio } = await params;
  const base = SERVICIOS_LP.find((x) => x.slug === servicio);
  if (!base) notFound();

  // Tere controla esto desde Gestión de Servicios: si el servicio no está "Publicado", su página se oculta.
  if (!(await estaPublicado(base))) redirect("/#servicios");

  const [overrides, zonas] = await Promise.all([
    getServiciosLPOverrides(),
    getZonasDomicilio(),
  ]);
  const s = mergeServicioLP(base, overrides[base.slug]);
  return <ServicioLanding s={s} zonas={zonas} />;
}
