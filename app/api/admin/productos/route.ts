import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY = process.env.MEDUSA_ADMIN_API_KEY;

function headers() {
  return { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
}

export async function GET() {
  if (!BASE || !KEY) return NextResponse.json({ products: [] });
  try {
    const res = await fetch(`${BASE}/admin/products?fields=id,title,description,thumbnail,status,+metadata&limit=100`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ products: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ products: [] });
  }
}

export async function PATCH(req: NextRequest) {
  if (!BASE || !KEY) return NextResponse.json({ error: "No configurado" }, { status: 500 });
  try {
    const { id, title, description, stock, precio, categoria, badge } = await req.json();

    // Actualizar metadata y campos del producto
    const body: Record<string, unknown> = {};
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (stock !== undefined || categoria !== undefined || badge !== undefined) {
      body.metadata = {
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(categoria !== undefined && { categoria }),
        ...(badge !== undefined && { badge }),
      };
    }

    const res = await fetch(`${BASE}/admin/products/${id}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ error: "Error al actualizar" }, { status: 400 });

    // Actualizar precio si viene
    if (precio !== undefined) {
      const prodRes = await fetch(`${BASE}/admin/products/${id}?fields=*variants`, {
        headers: headers(),
      });
      if (prodRes.ok) {
        const { product } = await prodRes.json();
        const variantId = product.variants?.[0]?.id;
        if (variantId) {
          // Obtener precios actuales del variant
          const vRes = await fetch(`${BASE}/admin/variants/${variantId}?fields=*prices`, {
            headers: headers(),
          });
          if (vRes.ok) {
            const { variant } = await vRes.json();
            const clpPrice = variant.prices?.find((p: { currency_code: string }) => p.currency_code === "clp");
            if (clpPrice) {
              // Actualizar precio existente
              await fetch(`${BASE}/admin/prices/${clpPrice.id}`, {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({ amount: Number(precio) }),
              });
            } else {
              // Crear precio CLP
              await fetch(`${BASE}/admin/variants/${variantId}/prices/batch`, {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({ create: [{ currency_code: "clp", amount: Number(precio) }] }),
              });
            }
          }
        }
      }
    }

    const updated = await res.json();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[admin/productos PATCH]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
