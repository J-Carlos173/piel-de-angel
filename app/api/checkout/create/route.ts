import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Environment, Options } from "transbank-sdk";

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
    const { items, customer, envio = 0 } = await req.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const subtotal: number = items.reduce(
      (sum: number, i: { precio: number; qty: number }) => sum + i.precio * i.qty,
      0
    );
    const total = subtotal + (envio ?? 0);

    const buyOrder = `PA-${Date.now()}`;
    // Guardamos el email en sessionId (Transbank lo devuelve al confirmar, máx 61 chars)
    const sessionId = customer.email.slice(0, 61);
    const returnUrl = `${SITE_URL}/api/checkout/confirm`;

    const tx = getTransaction();
    const response = await tx.create(buyOrder, sessionId, total, returnUrl);

    return NextResponse.json({ url: response.url, token: response.token, buyOrder });
  } catch (err) {
    console.error("[checkout/create]", err);
    return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 });
  }
}
