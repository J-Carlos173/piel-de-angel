export const dynamic = "force-dynamic";

import { SERVICIOS_LP } from "@/data/servicios-lp";
import { getServiciosLPOverrides, getZonasDomicilio, mergeServicioLP } from "@/lib/servicios-lp-content";
import PaginasClient from "./PaginasClient";

export default async function PaginasServiciosPage() {
  const [overrides, zonas] = await Promise.all([getServiciosLPOverrides(), getZonasDomicilio()]);
  const paginas = SERVICIOS_LP.map((base) => {
    const actual = mergeServicioLP(base, overrides[base.slug]);
    return {
      slug: base.slug,
      nombre: base.nombre,
      lead: actual.lead,
      metaDescription: actual.metaDescription,
      queEsTitulo: actual.queEs.titulo,
      queEsTexto: actual.queEs.texto,
      sesion: actual.sesion,
      paraTi: actual.paraTi,
      faq: actual.faq,
      waTexto: actual.waTexto,
    };
  });

  return <PaginasClient initialPaginas={paginas} initialZonas={zonas} />;
}
