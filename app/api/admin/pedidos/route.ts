import { NextRequest, NextResponse } from "next/server";
import { createPedido, deletePedido, getAllPedidos, updatePedido } from "@/lib/pedidos-db";
import { isAdminAuthorized as isAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const pedidos = await getAllPedidos();
    return NextResponse.json({ pedidos });
  } catch (err) {
    console.error("[admin/pedidos GET]", err);
    return NextResponse.json({ pedidos: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { texto, imagenes, hilo_id } = await req.json();
    if (!texto?.trim()) {
      return NextResponse.json({ error: "El pedido no puede estar vacío" }, { status: 400 });
    }
    const pedido = await createPedido(texto.trim(), Array.isArray(imagenes) ? imagenes : [], hilo_id ?? undefined);
    return NextResponse.json({ pedido });
  } catch (err) {
    console.error("[admin/pedidos POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id, estado, respuesta } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const pedido = await updatePedido(id, { estado, respuesta });
    return NextResponse.json({ pedido });
  } catch (err) {
    console.error("[admin/pedidos PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deletePedido(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/pedidos DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
