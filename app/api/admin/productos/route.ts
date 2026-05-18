import { NextRequest, NextResponse } from "next/server";

const BASE  = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const PASS  = process.env.MEDUSA_ADMIN_PASSWORD;

async function getToken(): Promise<string | null> {
  if (!BASE || !EMAIL || !PASS) return null;
  try {
    const res = await fetch(`${BASE}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASS }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function GET() {
  const token = await getToken();
  if (!token) {
    console.error("[admin/productos GET] No se pudo obtener token de Medusa");
    return NextResponse.json({ products: [] });
  }
  try {
    const res = await fetch(
      `${BASE}/admin/products?fields=id,title,description,thumbnail,status,+metadata,*variants,*variants.prices&limit=100`,
      { headers: authHeaders(token), cache: "no-store" }
    );
    if (!res.ok) {
      console.error("[admin/productos GET] Medusa error:", res.status, await res.text());
      return NextResponse.json({ products: [] });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[admin/productos GET]", err);
    return NextResponse.json({ products: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "No configurado" }, { status: 500 });
  try {
    const { id, title, description, stock, precio, categoria, badge } = await req.json();

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
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ error: "Error al actualizar" }, { status: 400 });

    if (precio !== undefined) {
      const prodRes = await fetch(`${BASE}/admin/products/${id}?fields=*variants,*variants.prices`, {
        headers: authHeaders(token),
      });
      if (prodRes.ok) {
        const { product } = await prodRes.json();
        const variant = product.variants?.[0];
        if (variant) {
          const clpPrice = variant.prices?.find((p: { currency_code: string }) => p.currency_code === "clp");
          const pricesPayload = clpPrice
            ? [{ id: clpPrice.id, currency_code: "clp", amount: Number(precio) }]
            : [{ currency_code: "clp", amount: Number(precio) }];
          await fetch(`${BASE}/admin/products/${id}/variants/${variant.id}`, {
            method: "POST",
            headers: authHeaders(token),
            body: JSON.stringify({ prices: pricesPayload }),
          });
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

export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "No configurado" }, { status: 500 });
  try {
    const { title, description, stock, precio, categoria, badge, thumbnail } = await req.json();

    // Crear producto con opciones y variante en una sola llamada (requerido por Medusa v2)
    const prodRes = await fetch(`${BASE}/admin/products`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        title,
        description,
        status: "published",
        ...(thumbnail && { thumbnail }),
        metadata: {
          stock: Number(stock ?? 0),
          ...(categoria && { categoria }),
          ...(badge && { badge }),
        },
        options: [{ title: "Titulo", values: ["Default"] }],
        variants: [{
          title: "Default",
          options: { Titulo: "Default" },
          prices: precio ? [{ currency_code: "clp", amount: Number(precio) }] : [],
        }],
      }),
    });
    if (!prodRes.ok) {
      const err = await prodRes.text();
      console.error("[admin/productos POST] create product error:", err);
      return NextResponse.json({ error: "Error al crear producto" }, { status: 400 });
    }
    const { product } = await prodRes.json();
    return NextResponse.json({ product });
  } catch (err) {
    console.error("[admin/productos POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
