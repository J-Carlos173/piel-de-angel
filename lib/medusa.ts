import { Producto } from "@/data/productos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Producto {
  return {
    id:          p.id,
    nombre:      p.title ?? "",
    categoria:   p.categoria ?? "",
    descripcion: p.description ?? "",
    precio:      Number(p.precio ?? 0),
    stock:       Number(p.stock ?? 0),
    badge:       (p.badge as "" | "bestseller" | "nuevo") ?? "",
    img:         p.thumbnail ?? "",
  };
}

export async function fetchProductos(): Promise<Producto[]> {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) return [];
    const { products } = await res.json();
    return (products ?? []).map(mapProduct);
  } catch {
    return [];
  }
}
