import { Producto } from "@/data/productos";

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const KEY  = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Producto {
  const variant = p.variants?.[0];
  const precio  = variant?.prices?.[0]?.amount ?? 0;
  const stock   = typeof p.metadata?.stock === "number" ? p.metadata.stock : 10;
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
    console.log("[medusa] fetching from:", BASE);
    const res = await fetch(
      `${BASE}/store/products?fields=*variants.prices,+metadata&limit=100`,
      { headers: { "x-publishable-api-key": KEY } }
    );
    console.log("[medusa] status:", res.status, res.ok);
    if (!res.ok) return [];
    const { products } = await res.json();
    console.log("[medusa] products count:", products?.length);
    return (products ?? []).map(mapProduct);
  } catch (e) {
    console.error("[medusa] error:", e);
    return [];
  }
}
