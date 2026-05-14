import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendDeclineToClient } from "@/lib/email";

const SECRET = process.env.BOOKING_SECRET || "piel-de-angel-secret";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const data = jwt.verify(token, SECRET) as {
      name: string;
      email: string;
      date: string;
      time: string;
    };

    await sendDeclineToClient(data);

    return new NextResponse(
      `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cita rechazada</title>
      <style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fdf9f7;}
      .box{text-align:center;padding:48px;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);}
      h2{color:#8B6F6F;}p{color:#666;}</style></head>
      <body><div class="box">
        <h2>Cita rechazada</h2>
        <p>Se notificó a <strong>${data.name}</strong> que la cita del <strong>${data.date}</strong> a las <strong>${data.time} hrs</strong> no pudo confirmarse.</p>
      </div></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Error</title>
      <style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fdf9f7;}
      .box{text-align:center;padding:48px;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);}
      h2{color:#8B6F6F;}p{color:#666;}</style></head>
      <body><div class="box"><h2 style="color:#c00;">Error</h2><p>El enlace expiró o ya fue usado.</p></div></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
