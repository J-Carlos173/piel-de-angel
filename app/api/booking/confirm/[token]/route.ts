import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createCalendarEvent } from "@/lib/calendar";
import { sendConfirmationToClient } from "@/lib/email";

const SECRET = process.env.BOOKING_SECRET || "piel-de-angel-secret";

const HTML_STYLE = `<style>body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fdf9f7;}.box{text-align:center;padding:48px;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);}h2{color:#8B6F6F;}p{color:#666;}</style>`;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  let data: { name: string; email: string; phone: string; service: string; date: string; time: string };

  try {
    const { token } = await params;
    data = jwt.verify(token, SECRET) as typeof data;
  } catch {
    return new NextResponse(
      `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Error</title>${HTML_STYLE}</head>
      <body><div class="box"><h2 style="color:#c00;">Error</h2><p>El enlace expiró o ya fue usado.</p></div></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  let calendarError = "";
  try {
    await createCalendarEvent(data);
  } catch (err) {
    console.error("[confirm] Calendar error:", err);
    calendarError = err instanceof Error ? err.message : String(err);
  }

  await sendConfirmationToClient(data).catch((err) =>
    console.error("[confirm] Email error:", err)
  );

  return new NextResponse(
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cita confirmada</title>${HTML_STYLE}</head>
    <body><div class="box">
      <h2>✓ Cita confirmada</h2>
      <p>Se agendó la cita de <strong>${data.name}</strong> para el <strong>${data.date}</strong> a las <strong>${data.time} hrs</strong>.</p>
      <p>Se envió confirmación al cliente.</p>
      ${calendarError ? `<p style="color:#c00;font-size:13px;margin-top:16px;">Aviso: no se pudo crear el evento en Google Calendar.<br/><code>${calendarError}</code></p>` : ""}
    </div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
