import { getSetting, setSetting } from "./db";
import { COMUNAS, SERVICIOS_LP, type ServicioLP } from "@/data/servicios-lp";

/** Lo que Tere puede editar de la página de un servicio, guardado en la base de datos. */
export type ServicioLPOverride = {
  lead?: string;
  metaDescription?: string;
  queEsTitulo?: string;
  queEsTexto?: string;
  sesion?: string;
  paraTi?: string[];
  faq?: { q: string; a: string }[];
  waTexto?: string;
};

const KEY_CONTENIDO = "servicios_lp_contenido";
const KEY_ZONAS = "zonas_domicilio";

export async function getServiciosLPOverrides(): Promise<Record<string, ServicioLPOverride>> {
  try {
    const raw = await getSetting(KEY_CONTENIDO);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveServicioLPOverride(slug: string, value: ServicioLPOverride): Promise<void> {
  const actuales = await getServiciosLPOverrides();
  actuales[slug] = value;
  await setSetting(KEY_CONTENIDO, JSON.stringify(actuales));
}

export async function getZonasDomicilio(): Promise<string[]> {
  try {
    const raw = await getSetting(KEY_ZONAS);
    const z = raw ? JSON.parse(raw) : null;
    return Array.isArray(z) && z.length > 0 ? z : COMUNAS;
  } catch {
    return COMUNAS;
  }
}

export async function saveZonasDomicilio(zonas: string[]): Promise<void> {
  await setSetting(KEY_ZONAS, JSON.stringify(zonas));
}

/** Aplica lo que Tere editó sobre el texto de base; si no editó un campo, se usa el original. */
export function mergeServicioLP(base: ServicioLP, ov?: ServicioLPOverride): ServicioLP {
  if (!ov) return base;
  return {
    ...base,
    lead: ov.lead?.trim() || base.lead,
    metaDescription: ov.metaDescription?.trim() || base.metaDescription,
    sesion: ov.sesion?.trim() || base.sesion,
    paraTi: ov.paraTi && ov.paraTi.length > 0 ? ov.paraTi : base.paraTi,
    faq: ov.faq && ov.faq.length > 0 ? ov.faq : base.faq,
    waTexto: ov.waTexto?.trim() || base.waTexto,
    queEs: {
      titulo: ov.queEsTitulo?.trim() || base.queEs.titulo,
      texto: ov.queEsTexto?.trim() || base.queEs.texto,
    },
  };
}

export function servicioLPConOverride(slug: string, overrides: Record<string, ServicioLPOverride>): ServicioLP | null {
  const base = SERVICIOS_LP.find((s) => s.slug === slug);
  if (!base) return null;
  return mergeServicioLP(base, overrides[slug]);
}
