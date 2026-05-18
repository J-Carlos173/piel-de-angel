import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Environment, Options } from "transbank-sdk";
import { sendOrderConfirmationToClient, sendOrderNotificationToAdmin } from "@/lib/email";
import { confirmOrder, getOrder } from "@/lib/db";
import { decrementProductStock } from "@/lib/products-db";

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

async function handleConfirm(tokenWs: string | null, tbkToken: string | null) {
  if (tbkToken && tokenWs) {
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=error`);
  }
  if (tbkToken && !tokenWs) {
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=cancelled`);
  }
  if (!tokenWs) {
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=timeout`);
  }

  try {
    const tx = getTransaction();
    const result = await tx.commit(tokenWs);

    if (result.response_code === 0) {
      const clientEmail = result.session_id ?? "";
      const card = result.card_detail?.card_number ?? "";
      const authCode = result.authorization_code ?? "";
      const amount = result.amount;
      const buyOrder = result.buy_order;

      // Actualizar estado en Neon y recuperar datos completos del pedido
      let orderData: Record<string, unknown> | null = null;
      try {
        await confirmOrder({ buyOrder, amount, authCode, cardLast4: card, tokenWs });
        orderData = await getOrder(buyOrder);

        // Descontar stock en Medusa por cada producto vendido
        if (orderData?.items) {
          const stockItems = (orderData.items as { id: string; qty: number }[])
            .filter((i) => i.id && i.qty)
            .map((i) => ({ id: i.id, qty: i.qty }));
          decrementProductStock(stockItems).catch(() => {});
        }
      } catch (dbErr) {
        console.error("[checkout/confirm/db]", dbErr);
      }

      // Enviar correos con datos completos si están disponibles
      try {
        const items = orderData?.items ? (orderData.items as { nombre: string; precio: number; qty: number }[]) : [];
        const customer = orderData
          ? {
              nombre: String(orderData.customer_nombre ?? ""),
              email: String(orderData.customer_email ?? clientEmail),
              telefono: String(orderData.customer_tel ?? ""),
              direccion: String(orderData.customer_dir ?? ""),
              depto: String(orderData.customer_depto ?? ""),
              ciudad: String(orderData.customer_ciudad ?? ""),
              region: String(orderData.customer_region ?? ""),
            }
          : null;
        const envio = Number(orderData?.envio ?? 0);
        const zona = String(orderData?.zona ?? "santiago");

        await Promise.all([
          clientEmail
            ? sendOrderConfirmationToClient({
                email: clientEmail,
                buyOrder,
                amount,
                authCode,
                card,
                items,
                customer,
              })
            : Promise.resolve(),
          sendOrderNotificationToAdmin({
            clientEmail,
            buyOrder,
            amount,
            authCode,
            card,
            items,
            customer,
            envio,
            zona,
          }),
        ]);
      } catch (emailErr) {
        console.error("[checkout/emails]", emailErr);
      }

      const qs = new URLSearchParams({
        order: buyOrder,
        amount: String(amount),
        card,
        auth: authCode,
      });
      return NextResponse.redirect(`${SITE_URL}/checkout/success?${qs}`);
    }

    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=rejected`);
  } catch (err) {
    console.error("[checkout/confirm]", err);
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=error`);
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return handleConfirm(sp.get("token_ws"), sp.get("TBK_TOKEN"));
}

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null);
  const get = (k: string) =>
    (body?.get(k) as string | null) ?? req.nextUrl.searchParams.get(k);
  return handleConfirm(get("token_ws"), get("TBK_TOKEN"));
}
