import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { createPromoWeb, deletePromoWeb, getAllPromosWeb, updatePromoWeb } from "@/lib/promos-web-db";

export const dynamic = "force-dynamic";

const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    return NextResponse.json({ promos: await getAllPromosWeb() });
  } catch (err) {
    console.error("[admin/promos-web GET]", err);
    return NextResponse.json({ promos: [], error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const body = await req.json();
    if (!body.title?.trim()) return NextResponse.json({ error: "Falta el título" }, { status: 400 });
    const promo = await createPromoWeb({
      tag: body.tag?.trim() || "",
      title: body.title.trim(),
      description: body.description?.trim() || "",
      prizes: Array.isArray(body.prizes) ? body.prizes.map((p: string) => p.trim()).filter(Boolean) : [],
      cta: body.cta?.trim() || "Ver publicación",
      href: body.href?.trim() || "",
      finalizado: Boolean(body.finalizado),
      activo: body.activo !== undefined ? Boolean(body.activo) : true,
      orden: Number(body.orden ?? 0),
    });
    revalidatePath("/");
    return NextResponse.json({ promo });
  } catch (err) {
    console.error("[admin/promos-web POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { id, ...campos } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const promo = await updatePromoWeb(Number(id), {
      ...(campos.tag !== undefined && { tag: String(campos.tag).trim() }),
      ...(campos.title !== undefined && { title: String(campos.title).trim() }),
      ...(campos.description !== undefined && { description: String(campos.description).trim() }),
      ...(campos.prizes !== undefined && {
        prizes: Array.isArray(campos.prizes) ? campos.prizes.map((p: string) => p.trim()).filter(Boolean) : [],
      }),
      ...(campos.cta !== undefined && { cta: String(campos.cta).trim() }),
      ...(campos.href !== undefined && { href: String(campos.href).trim() }),
      ...(campos.finalizado !== undefined && { finalizado: Boolean(campos.finalizado) }),
      ...(campos.activo !== undefined && { activo: Boolean(campos.activo) }),
      ...(campos.orden !== undefined && { orden: Number(campos.orden) }),
    });
    revalidatePath("/");
    return NextResponse.json({ promo });
  } catch (err) {
    console.error("[admin/promos-web PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deletePromoWeb(Number(id));
    revalidatePath("/");
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/promos-web DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
