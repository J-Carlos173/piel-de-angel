import { NextResponse } from "next/server";
import { createProduct, ensureProductsTable } from "@/lib/products-db";

const BASE  = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const PASS  = process.env.MEDUSA_ADMIN_PASSWORD;

async function getToken(): Promise<string | null> {
  if (!BASE || !EMAIL || !PASS) return null;
  const res = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { token } = await res.json();
  return token ?? null;
}

export async function POST() {
  try {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: "No se pudo autenticar con Medusa" }, { status: 500 });

    const res = await fetch(
      `${BASE}/admin/products?fields=id,title,description,thumbnail,status,+metadata,*variants,*variants.prices&limit=100`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ error: "Error al obtener productos de Medusa" }, { status: 500 });

    const { products } = await res.json();
    await ensureProductsTable();

    const results = [];
    for (const p of products) {
      const clpPrice = p.variants?.[0]?.prices?.find((pr: { currency_code: string }) => pr.currency_code === "clp");
      const precio = clpPrice?.amount ?? 0;

      // Reemplazar localhost:9000 con URL pública de Railway
      let thumbnail = p.thumbnail ?? "";
      if (thumbnail && BASE) thumbnail = thumbnail.replace(/https?:\/\/localhost:\d+/, BASE);

      const created = await createProduct({
        title: p.title ?? "",
        description: p.description ?? "",
        thumbnail,
        status: p.status === "published" ? "published" : "draft",
        precio,
        stock: typeof p.metadata?.stock === "number" ? p.metadata.stock : 0,
        categoria: p.metadata?.categoria ?? "",
        badge: p.metadata?.badge ?? "",
      });
      results.push({ medusaId: p.id, neonId: created.id, title: created.title });
    }

    return NextResponse.json({ migrated: results.length, products: results });
  } catch (err) {
    console.error("[migrate]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
