import { NextRequest, NextResponse } from "next/server";
import { getAllServicios, createServicio, updateServicio, deleteServicio } from "@/lib/services-db";

export async function GET() {
  try {
    const servicios = await getAllServicios();
    return NextResponse.json({ servicios });
  } catch (err) {
    console.error("[admin/servicios GET]", err);
    return NextResponse.json({ servicios: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, thumbnail, precio, duracion, categoria, orden } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

    const servicio = await createServicio({
      title,
      description: description ?? "",
      thumbnail: thumbnail ?? "",
      status: "published",
      precio: Number(precio ?? 0),
      duracion: Number(duracion ?? 0),
      categoria: categoria ?? "",
      orden: Number(orden ?? 0),
    });
    return NextResponse.json({ servicio });
  } catch (err) {
    console.error("[admin/servicios POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, thumbnail, status, precio, duracion, categoria, orden } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const updated = await updateServicio(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(thumbnail !== undefined && { thumbnail }),
      ...(status !== undefined && { status }),
      ...(precio !== undefined && { precio: Number(precio) }),
      ...(duracion !== undefined && { duracion: Number(duracion) }),
      ...(categoria !== undefined && { categoria }),
      ...(orden !== undefined && { orden: Number(orden) }),
    });
    return NextResponse.json({ servicio: updated });
  } catch (err) {
    console.error("[admin/servicios PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deleteServicio(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/servicios DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
