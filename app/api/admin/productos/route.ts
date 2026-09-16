import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "@/lib/products-db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[admin/productos GET]", err);
    return NextResponse.json({ products: [] });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, title, description, thumbnail, status, precio, precio_oferta, stock, categoria, badge } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const updated = await updateProduct(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(thumbnail !== undefined && { thumbnail }),
      ...(status !== undefined && { status }),
      ...(precio !== undefined && { precio: Number(precio) }),
      ...(precio_oferta !== undefined && { precio_oferta: precio_oferta === null ? null : Number(precio_oferta) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(categoria !== undefined && { categoria }),
      ...(badge !== undefined && { badge }),
    });
    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error("[admin/productos PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { title, description, precio, precio_oferta, stock, categoria, badge, thumbnail } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

    const product = await createProduct({
      title,
      description: description ?? "",
      thumbnail: thumbnail ?? "",
      status: "published",
      precio: Number(precio ?? 0),
      precio_oferta: precio_oferta != null ? Number(precio_oferta) : null,
      stock: Number(stock ?? 0),
      categoria: categoria ?? "",
      badge: badge ?? "",
    });
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[admin/productos POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deleteProduct(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("[admin/productos DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
