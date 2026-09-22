import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { createConsejo, deleteConsejo, getAllConsejos, updateConsejo } from "@/lib/consejos-db";

export const dynamic = "force-dynamic";

const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    return NextResponse.json({ consejos: await getAllConsejos() });
  } catch (err) {
    console.error("[admin/consejos GET]", err);
    return NextResponse.json({ consejos: [], error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const body = await req.json();
    if (!body.titulo?.trim()) return NextResponse.json({ error: "Falta el título" }, { status: 400 });
    const consejo = await createConsejo({
      categoria: body.categoria?.trim() || "",
      titulo: body.titulo.trim(),
      texto: body.texto?.trim() || "",
      fuente: body.fuente?.trim() || "",
      imagen: body.imagen?.trim() || "",
      icono: body.icono?.trim() || "",
      activo: body.activo !== undefined ? Boolean(body.activo) : true,
      orden: Number(body.orden ?? 0),
    });
    revalidatePath("/");
    revalidatePath("/consejos");
    return NextResponse.json({ consejo });
  } catch (err) {
    console.error("[admin/consejos POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { id, ...campos } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const consejo = await updateConsejo(Number(id), {
      ...(campos.categoria !== undefined && { categoria: String(campos.categoria).trim() }),
      ...(campos.titulo !== undefined && { titulo: String(campos.titulo).trim() }),
      ...(campos.texto !== undefined && { texto: String(campos.texto).trim() }),
      ...(campos.fuente !== undefined && { fuente: String(campos.fuente).trim() }),
      ...(campos.imagen !== undefined && { imagen: String(campos.imagen).trim() }),
      ...(campos.icono !== undefined && { icono: String(campos.icono).trim() }),
      ...(campos.activo !== undefined && { activo: Boolean(campos.activo) }),
      ...(campos.orden !== undefined && { orden: Number(campos.orden) }),
    });
    revalidatePath("/");
    revalidatePath("/consejos");
    return NextResponse.json({ consejo });
  } catch (err) {
    console.error("[admin/consejos PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deleteConsejo(Number(id));
    revalidatePath("/");
    revalidatePath("/consejos");
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/consejos DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
