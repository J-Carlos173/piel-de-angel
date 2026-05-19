import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "krlos173173@gmail.com";

// Bloques de 90 min (1h30) — Tere indicó entre 1.5 y 2 hrs según servicio
const SLOT_DURATION_MIN = 90;

// Horarios disponibles por día (0=Dom,1=Lun,2=Mar,3=Mié,4=Jue,5=Vie,6=Sáb)
// Temporada: mientras Tere trabaja en Adonai-Sidim
const SCHEDULE: Record<number, string[]> = {
  2: ["16:00", "18:00"],                 // Martes
  3: ["16:00", "18:00"],                 // Miércoles
  4: ["16:00", "18:00", "20:00"],        // Jueves
  5: ["16:00", "18:00", "20:00"],        // Viernes
  6: ["09:30", "11:30", "13:30"],        // Sábado
};

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

export function getAllSlots(dateStr: string): string[] {
  const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  return SCHEDULE[dayOfWeek] ?? [];
}

export function isWorkingDay(dateStr: string): boolean {
  const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  return dayOfWeek in SCHEDULE;
}

export async function getBusySlots(dateStr: string): Promise<string[]> {
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
    const busySlots: string[] = [];

    for (const slot of getAllSlots(dateStr)) {
      const slotStart = new Date(`${dateStr}T${slot}:00`);
      const slotEnd   = new Date(slotStart.getTime() + SLOT_DURATION_MIN * 60 * 1000);

      const occupied = busy.some(({ start, end }) => {
        if (!start || !end) return false;
        return slotStart < new Date(end) && slotEnd > new Date(start);
      });

      if (occupied) busySlots.push(slot);
    }

    return busySlots;
  } catch {
    return [];
  }
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
