import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendBookingRequestToAdmin } from "@/lib/email";
import { getSetting } from "@/lib/db";

const SECRET = process.env.BOOKING_SECRET || "piel-de-angel-secret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, date, time } = body;

    if (!name || !email || !phone || !service || !date || !time) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const token = jwt.sign({ name, email, phone, service, date, time }, SECRET, {
      expiresIn: "7d",
    });

    const citasOff = await getSetting("notif_citas").catch(() => null);
    if (citasOff !== "false") {
      await sendBookingRequestToAdmin({ name, email, phone, service, date, time, token });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
