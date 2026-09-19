import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Environment, Options } from "transbank-sdk";
import { saveOrderPending, type OrderItem } from "@/lib/db";
import { validatePromo } from "@/lib/promos-db";
import { getPublishedProducts } from "@/lib/products-db";
import { precioFinal } from "@/data/productos";
import { calcularEnvio, esZonaValida, type ZonaEnvio } from "@/lib/pricing";

const COMMERCE_CODE = process.env.TRANSBANK_COMMERCE_CODE!;
const API_KEY = process.env.TRANSBANK_API_KEY!;
const IS_PROD = process.env.TRANSBANK_ENV === "production";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getTransaction() {
  const options = new Options(
    COMMERCE_CODE,
    API_KEY,
    IS_PROD ? Environment.Production : Environment.Integration
  );
  return new WebpayPlus.Transaction(options);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, promoCode = "" } = body;
    const zona: ZonaEnvio = esZonaValida(body.zona) ? body.zona : "santiago";

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    // Los precios y el envío se calculan acá con los datos de la base: lo que
    // manda el navegador (precio, envío, total) nunca se usa para cobrar.
    const catalogo = new Map((await getPublishedProducts()).map((p) => [p.id, p]));
    const items: OrderItem[] = [];
    for (const raw of body.items as { id?: string; qty?: number }[]) {
      const prod = raw?.id ? catalogo.get(raw.id) : undefined;
      const qty = Number(raw?.qty);
      if (!prod || !Number.isInteger(qty) || qty < 1) {
        return NextResponse.json({ error: "Uno de los productos del carrito ya no está disponible. Revisa tu carrito." }, { status: 400 });
      }
      if (prod.stock < qty) {
        return NextResponse.json({ error: `Solo quedan ${prod.stock} unidades de ${prod.title}.` }, { status: 400 });
      }
      items.push({ id: prod.id, nombre: prod.title, precio: precioFinal(prod), qty });
    }

    const subtotal = items.reduce((sum, i) => sum + i.precio * i.qty, 0);
    const envio = calcularEnvio(subtotal, zona);

    const promo = promoCode ? await validatePromo(promoCode) : null;
    const descuento = promo?.discount ?? 0;
    const total = Math.max(0, subtotal + envio - descuento);

    const buyOrder = `PA-${Date.now()}`;
    const sessionId = customer.email.slice(0, 61);
    const returnUrl = `${SITE_URL}/api/checkout/confirm`;

    // Guardar pedido completo en Neon antes de redirigir a Transbank
    try {
      await saveOrderPending({ buyOrder, customer, items, subtotal, envio, descuento, total, zona, promoCode: promo?.code ?? "" });
    } catch (dbErr) {
      console.error("[checkout/create/db]", dbErr);
    }

    const tx = getTransaction();
    const response = await tx.create(buyOrder, sessionId, total, returnUrl);

    // Guardar token desde creación para recuperarlo en cualquier escenario
    try {
      const { getDb } = await import("@/lib/db");
      const sql = getDb();
      await sql`UPDATE orders SET token_ws = ${response.token} WHERE buy_order = ${buyOrder}`;
    } catch {}

    return NextResponse.json({ url: response.url, token: response.token, buyOrder });
  } catch (err) {
    console.error("[checkout/create]", err);
    return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 });
  }
}
