import { Producto } from "@/data/productos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Producto {
  const variant = p.variants?.[0];
  const precio  = variant?.prices?.[0]?.amount ?? 0;

  // Prioridad: inventory_quantity del variant (Medusa nativo) → metadata.stock → 10
  let stock: number;
  if (variant?.manage_inventory === true && typeof variant?.inventory_quantity === "number") {
    stock = variant.inventory_quantity;
  } else if (typeof p.metadata?.stock === "number") {
    stock = p.metadata.stock;
  } else {
    stock = 10;
  }

  const badge   = (p.metadata?.badge as "" | "bestseller" | "nuevo") ?? "";

  return {
    id:          p.id,
    nombre:      p.title ?? "",
    categoria:   p.metadata?.categoria ?? "",
    descripcion: p.description ?? "",
    precio,
    stock,
    badge,
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
