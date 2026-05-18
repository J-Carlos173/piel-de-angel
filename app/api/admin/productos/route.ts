import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "@/lib/products-db";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[admin/productos GET]", err);
    return NextResponse.json({ products: [] });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, thumbnail, status, precio, stock, categoria, badge } = body;
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const updated = await updateProduct(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(thumbnail !== undefined && { thumbnail }),
      ...(status !== undefined && { status }),
      ...(precio !== undefined && { precio: Number(precio) }),
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
  try {
    const { title, description, precio, stock, categoria, badge, thumbnail } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

    const product = await createProduct({
      title,
      description: description ?? "",
      thumbnail: thumbnail ?? "",
      status: "published",
      precio: Number(precio ?? 0),
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
