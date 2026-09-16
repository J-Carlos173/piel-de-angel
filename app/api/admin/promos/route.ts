import { NextRequest, NextResponse } from "next/server";
import { getAllPromos, createPromo, deletePromo, togglePromoActive } from "@/lib/promos-db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const promos = await getAllPromos();
    return NextResponse.json({ promos });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { code, discount, max_uses } = await req.json();
    if (!code?.trim() || !discount) return NextResponse.json({ error: "Código y descuento son obligatorios" }, { status: 400 });
    const promo = await createPromo({
      code,
      discount: Number(discount),
      max_uses: Number(max_uses ?? 1),
    });
    return NextResponse.json({ promo });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Ese código ya existe" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id, active } = await req.json();
    await togglePromoActive(Number(id), Boolean(active));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    await deletePromo(Number(id));
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
