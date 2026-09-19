import { NextRequest, NextResponse } from "next/server";
import { createTarea, deleteTarea, getAllTareas, updateTarea } from "@/lib/tareas-db";
import { isAdminAuthorized } from "@/lib/admin-auth";

const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    return NextResponse.json({ tareas: await getAllTareas() });
  } catch (err) {
    console.error("[admin/tareas GET]", err);
    return NextResponse.json({ tareas: [], error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { tipo, titulo, detalle, responsable, vence } = await req.json();
    if (!titulo?.trim()) return NextResponse.json({ error: "Falta el título" }, { status: 400 });
    const tarea = await createTarea({
      tipo: tipo === "nota" ? "nota" : "tarea",
      titulo: String(titulo).trim(),
      detalle: detalle?.trim() || undefined,
      responsable: responsable || undefined,
      vence: vence || undefined,
    });
    return NextResponse.json({ tarea });
  } catch (err) {
    console.error("[admin/tareas POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { id, ...campos } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const tarea = await updateTarea(Number(id), {
      ...(campos.titulo !== undefined && { titulo: String(campos.titulo).trim() }),
      ...(campos.detalle !== undefined && { detalle: campos.detalle?.trim() || null }),
      ...(campos.responsable !== undefined && { responsable: campos.responsable || null }),
      ...(campos.vence !== undefined && { vence: campos.vence || null }),
      ...(campos.hecha !== undefined && { hecha: Boolean(campos.hecha) }),
    });
    return NextResponse.json({ tarea });
  } catch (err) {
    console.error("[admin/tareas PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) return noAutorizado();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deleteTarea(Number(id));
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/tareas DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
