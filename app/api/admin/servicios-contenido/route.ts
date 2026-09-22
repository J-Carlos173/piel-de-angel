import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { SERVICIOS_LP } from "@/data/servicios-lp";
import {
  getServiciosLPOverrides,
  getZonasDomicilio,
  saveServicioLPOverride,
  saveZonasDomicilio,
  type ServicioLPOverride,
} from "@/lib/servicios-lp-content";

export const dynamic = "force-dynamic";

const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });
const SLUGS_VALIDOS = new Set(SERVICIOS_LP.map((s) => s.slug));

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const [overrides, zonas] = await Promise.all([getServiciosLPOverrides(), getZonasDomicilio()]);
    return NextResponse.json({ overrides, zonas });
  } catch (err) {
    console.error("[admin/servicios-contenido GET]", err);
    return NextResponse.json({ overrides: {}, zonas: [], error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const body = await req.json();

    if (body.zonas) {
      const zonas = Array.isArray(body.zonas)
        ? body.zonas.map((z: unknown) => String(z).trim()).filter(Boolean)
        : [];
      if (zonas.length === 0) return NextResponse.json({ error: "Falta al menos una comuna" }, { status: 400 });
      await saveZonasDomicilio(zonas);
      revalidatePath("/");
      for (const slug of SLUGS_VALIDOS) revalidatePath(`/${slug}`);
      return NextResponse.json({ ok: true, zonas });
    }

    const { slug, value } = body as { slug?: string; value?: ServicioLPOverride };
    if (!slug || !SLUGS_VALIDOS.has(slug)) return NextResponse.json({ error: "Servicio inválido" }, { status: 400 });
    if (!value || typeof value !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

    const limpio: ServicioLPOverride = {
      lead: value.lead?.trim() || undefined,
      metaDescription: value.metaDescription?.trim() || undefined,
      queEsTitulo: value.queEsTitulo?.trim() || undefined,
      queEsTexto: value.queEsTexto?.trim() || undefined,
      sesion: value.sesion?.trim() || undefined,
      paraTi: Array.isArray(value.paraTi) ? value.paraTi.map((t) => t.trim()).filter(Boolean) : undefined,
      faq: Array.isArray(value.faq)
        ? value.faq.map((f) => ({ q: f.q?.trim() || "", a: f.a?.trim() || "" })).filter((f) => f.q && f.a)
        : undefined,
      waTexto: value.waTexto?.trim() || undefined,
    };

    await saveServicioLPOverride(slug, limpio);
    revalidatePath(`/${slug}`);
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/servicios-contenido POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
