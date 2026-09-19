import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicioLanding from "@/components/ServicioLanding";
import { SERVICIOS_LP } from "@/data/servicios-lp";

export const revalidate = 3600;
export const dynamicParams = false;

const SITE = "https://www.pieldeangel.cl";

export function generateStaticParams() {
  return SERVICIOS_LP.map((s) => ({ servicio: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ servicio: string }> }): Promise<Metadata> {
  const { servicio } = await params;
  const s = SERVICIOS_LP.find((x) => x.slug === servicio);
  if (!s) return {};
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
  const s = SERVICIOS_LP.find((x) => x.slug === servicio);
  if (!s) notFound();
  return <ServicioLanding s={s} />;
}
