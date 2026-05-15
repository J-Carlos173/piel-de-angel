import { NextRequest, NextResponse } from "next/server";
import { sendPendingOrderToClient, sendPendingOrderToAdmin } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { items, customer, envio, total, zona } = await req.json();

  if (!items?.length) return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });

  const buyOrder = `PA-${Date.now()}`;

  try {
    await Promise.all([
      sendPendingOrderToClient({ email: customer.email, nombre: customer.nombre, buyOrder, items, envio, total }),
      sendPendingOrderToAdmin({ customer, buyOrder, items, envio, total, zona }),
    ]);
  } catch (err) {
    console.error("Error enviando correos de pedido:", err);
  }

  return NextResponse.json({ ok: true, buyOrder });
}
