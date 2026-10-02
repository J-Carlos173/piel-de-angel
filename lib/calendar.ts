import { google } from "googleapis";
import { getBlockedSlots } from "./blocked-slots-db";
import { getHorarioAgenda } from "./horario-agenda";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "krlos173173@gmail.com";

// Duración de cada cita — Tere indicó entre 1.5 y 2 hrs según servicio. No es "cuántas horas
// hay para elegir" (eso lo decide Tere directamente, ver abajo), es cuánto tiempo se bloquea
// en el Google Calendar cuando se confirma una.
const SLOT_DURATION_MIN = 90;

// El horario (qué días y qué horas exactas se pueden reservar) lo edita Tere desde
// Panel → Agenda → Horario de atención: una lista de horas por día, no un rango calculado.

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const credentials = JSON.parse(key);
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function getAllSlots(dateStr: string): Promise<string[]> {
  const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  const horario = await getHorarioAgenda();
  const dia = horario[dayOfWeek];
  return dia?.activo ? dia.horas : [];
}

export async function isWorkingDay(dateStr: string): Promise<boolean> {
  const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  const horario = await getHorarioAgenda();
  return !!horario[dayOfWeek]?.activo;
}

export async function getBusySlots(dateStr: string): Promise<string[]> {
  const busySlots = new Set<string>();

  // 1. Bloqueos manuales desde la DB
  try {
    const manualBlocks = await getBlockedSlots(dateStr);
    manualBlocks.forEach((b) => busySlots.add(b.time));
  } catch { /* no bloquea si falla la DB */ }

  // 2. Eventos del Google Calendar
  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const dayStart = new Date(`${dateStr}T00:00:00-04:00`).toISOString();
    const dayEnd   = new Date(`${dateStr}T23:59:59-04:00`).toISOString();

    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: dayStart,
        timeMax: dayEnd,
        timeZone: "America/Santiago",
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busy = res.data.calendars?.[CALENDAR_ID]?.busy ?? [];

    for (const slot of await getAllSlots(dateStr)) {
      const slotStart = new Date(`${dateStr}T${slot}:00`);
      const slotEnd   = new Date(slotStart.getTime() + SLOT_DURATION_MIN * 60 * 1000);

      const occupied = busy.some(({ start, end }) => {
        if (!start || !end) return false;
        return slotStart < new Date(end) && slotEnd > new Date(start);
      });

      if (occupied) busySlots.add(slot);
    }
  } catch { /* si Google falla, se devuelven solo los bloqueos manuales */ }

  return [...busySlots];
}

export async function createCalendarEvent(data: {
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  service: string;
}) {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const startMs = new Date(`${data.date}T${data.time}:00`).getTime();
  const endDate = new Date(startMs + SLOT_DURATION_MIN * 60 * 1000);
  const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

  await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `Cita: ${data.name} — ${data.service}`,
      description: `Cliente: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\nServicio: ${data.service}`,
      start: { dateTime: `${data.date}T${data.time}:00`, timeZone: "America/Santiago" },
      end:   { dateTime: `${data.date}T${endTime}:00`,   timeZone: "America/Santiago" },
    },
  });
}
