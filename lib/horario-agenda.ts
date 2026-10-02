import { getSetting, setSetting } from "./db";
import { HORARIO_DEFAULT, sanearHorario, type HorarioAgenda } from "./horario-agenda-shared";

export type { HorarioAgenda, HorarioDia } from "./horario-agenda-shared";
export { HORARIO_DEFAULT, describirHorario } from "./horario-agenda-shared";

const KEY = "horario_agenda";

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
  await setSetting(KEY, JSON.stringify(limpio));
  return limpio;
}
