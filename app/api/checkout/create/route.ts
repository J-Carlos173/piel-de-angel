import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Environment, Options } from "transbank-sdk";
import { saveOrderPending } from "@/lib/db";
import { validatePromo } from "@/lib/promos-db";

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
    const { items, customer, envio = 0, zona = "santiago", promoCode = "" } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const subtotal: number = items.reduce(
      (sum: number, i: { precio: number; qty: number }) => sum + i.precio * i.qty,
      0
    );

    const promo = promoCode ? await validatePromo(promoCode) : null;
    const descuento = promo?.discount ?? 0;
    const total = Math.max(0, subtotal + (envio ?? 0) - descuento);

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
