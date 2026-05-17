import { NextResponse } from "next/server";
import { sendOrderConfirmationToClient, sendOrderNotificationToAdmin } from "@/lib/email";

export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get("to") || process.env.GMAIL_USER || "";

  const debug = {
    to,
    GMAIL_USER: process.env.GMAIL_USER ? "SET" : "NOT SET",
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? "SET" : "NOT SET",
    STORE_EMAIL: process.env.STORE_EMAIL || "(usando default)",
    clientEmailResult: "" as string,
    adminEmailResult: "" as string,
  };

  try {
    await sendOrderConfirmationToClient({
      email: to,
      buyOrder: "PA-TEST-000",
      amount: 29990,
      authCode: "TEST123",
      card: "6623",
    });
    debug.clientEmailResult = "ok";
  } catch (err) {
    debug.clientEmailResult = "ERROR: " + String(err);
  }

  try {
    await sendOrderNotificationToAdmin({
      clientEmail: to,
      buyOrder: "PA-TEST-000",
      amount: 29990,
      authCode: "TEST123",
      card: "6623",
    });
    debug.adminEmailResult = "ok";
  } catch (err) {
    debug.adminEmailResult = "ERROR: " + String(err);
  }

  const ok = debug.clientEmailResult === "ok" && debug.adminEmailResult === "ok";
  return NextResponse.json({ ok, debug });
}
