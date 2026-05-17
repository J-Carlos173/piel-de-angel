import { NextResponse } from "next/server";
import { sendOrderConfirmationToClient, sendOrderNotificationToAdmin } from "@/lib/email";

// GET /api/test-email?to=correo@ejemplo.com
export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get("to") || process.env.GMAIL_USER || "";

  try {
    await Promise.all([
      sendOrderConfirmationToClient({
        email: to,
        buyOrder: "PA-TEST-000",
        amount: 29990,
        authCode: "TEST123",
        card: "6623",
      }),
      sendOrderNotificationToAdmin({
        clientEmail: to,
        buyOrder: "PA-TEST-000",
        amount: 29990,
        authCode: "TEST123",
        card: "6623",
      }),
    ]);
    return NextResponse.json({ ok: true, sentTo: to, storeEmail: process.env.STORE_EMAIL });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
