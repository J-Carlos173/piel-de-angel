import { getSetting, setSetting } from "./db";
import { HORARIO_DEFAULT, sanearHorario, type HorarioAgenda } from "./horario-agenda-shared";

export type { HorarioAgenda, HorarioDia } from "./horario-agenda-shared";
export { HORARIO_DEFAULT, describirHorario } from "./horario-agenda-shared";

const KEY = "horario_agenda";
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export async function getHorarioAgenda(): Promise<HorarioAgenda> {
  try {
    const raw = await getSetting(KEY);
    return raw ? sanearHorario(JSON.parse(raw)) : HORARIO_DEFAULT;
  } catch {
    return HORARIO_DEFAULT;
  }
}

export async function saveHorarioAgenda(data: unknown): Promise<HorarioAgenda> {
  const limpio = sanearHorario(data);
  for (const [i, d] of limpio.entries()) {
    if (d.activo) {
      const [hIni, mIni] = d.inicio.split(":").map(Number);
      const [hFin, mFin] = d.fin.split(":").map(Number);
      if (hIni * 60 + mIni >= hFin * 60 + mFin) {
        throw new Error(`${DIAS[i]}: la hora de inicio debe ser antes que la de cierre`);
      }
    }
  }
  await setSetting(KEY, JSON.stringify(limpio));
  return limpio;
}
