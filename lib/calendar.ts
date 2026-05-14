import { google } from "googleapis";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "krlos173173@gmail.com";

const BUSINESS_HOURS = { start: 9, end: 17 };
const LUNCH_BREAK = { start: 13, end: 14 };
const SLOT_DURATION = 60; // minutes

function getAuth() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const credentials = JSON.parse(key);
  // Vercel sometimes double-escapes newlines in the private key
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export function getAllSlots(dateStr: string): string[] {
  const slots: string[] = [];
  for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h += SLOT_DURATION / 60) {
    if (h >= LUNCH_BREAK.start && h < LUNCH_BREAK.end) continue;
    const hour = String(h).padStart(2, "0");
    slots.push(`${hour}:00`);
  }
  return slots;
}

export async function getBusySlots(dateStr: string): Promise<string[]> {
  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const dayStart = new Date(`${dateStr}T00:00:00-04:00`).toISOString();
    const dayEnd = new Date(`${dateStr}T23:59:59-04:00`).toISOString();

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

    for (const { start, end } of busy) {
      if (!start || !end) continue;
      const startHour = new Date(start).getHours();
      const endHour = new Date(end).getHours();
      for (let h = startHour; h < endHour; h++) {
        busySlots.push(`${String(h).padStart(2, "0")}:00`);
      }
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

  const [hour, minute] = data.time.split(":").map(Number);
  const start = new Date(`${data.date}T${data.time}:00`);
  const end = new Date(start.getTime() + SLOT_DURATION * 60 * 1000);

  await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `Cita: ${data.name} — ${data.service}`,
      description: `Cliente: ${data.name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\nServicio: ${data.service}`,
      start: { dateTime: start.toISOString(), timeZone: "America/Santiago" },
      end: { dateTime: end.toISOString(), timeZone: "America/Santiago" },
    },
  });
}
