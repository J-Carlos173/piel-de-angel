import { NextResponse } from "next/server";
import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "krlos173173@gmail.com";

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const credentials = JSON.parse(key);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
}

export type Cita = {
  id: string;
  fecha: string;       // "2026-05-20"
  hora: string;        // "10:00"
  nombre: string;
  email: string;
  telefono: string;
  servicio: string;
  pasada: boolean;
};

export async function GET() {
  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const pastLimit = new Date(now);
    pastLimit.setDate(now.getDate() - 90);
    const futureLimit = new Date(now);
    futureLimit.setDate(now.getDate() + 90);

    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: pastLimit.toISOString(),
      timeMax: futureLimit.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    const events = res.data.items ?? [];
    const citas: Cita[] = [];

    for (const ev of events) {
      const summary = ev.summary ?? "";
      if (!summary.startsWith("Cita:")) continue;

      const startRaw = ev.start?.dateTime ?? ev.start?.date ?? "";
      const startDate = new Date(startRaw);

      const fecha = startDate.toLocaleDateString("es-CL", {
        timeZone: "America/Santiago",
        year: "numeric", month: "2-digit", day: "2-digit",
      }).split("-").reverse().join("-");

      const hora = startDate.toLocaleTimeString("es-CL", {
        timeZone: "America/Santiago",
        hour: "2-digit", minute: "2-digit", hour12: false,
      });

      const desc = ev.description ?? "";
      const get = (label: string) => {
        const match = desc.match(new RegExp(`${label}:\\s*(.+)`));
        return match?.[1]?.trim() ?? "";
      };

      citas.push({
        id: ev.id ?? startRaw,
        fecha,
        hora,
        nombre: get("Cliente"),
        email: get("Email"),
        telefono: get("Teléfono"),
        servicio: get("Servicio"),
        pasada: startDate < now,
      });
    }

    return NextResponse.json({ citas });
  } catch (err) {
    console.error("[admin/agenda]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
