// Sin nada de base de datos acá: este archivo lo puede importar tanto el servidor
// como componentes de cliente (el panel de horario).

export type HorarioDia = { activo: boolean; horas: string[] };
/** Índice 0=Domingo … 6=Sábado, igual que Date.getDay(). */
export type HorarioAgenda = HorarioDia[];

/** Genera horas de inicio cada `pasoMin` minutos dentro de una ventana, sin pasarse del cierre. */
function generarHoras(inicio: string, fin: string, pasoMin = 90): string[] {
  const [hIni, mIni] = inicio.split(":").map(Number);
  const [hFin, mFin] = fin.split(":").map(Number);
  const inicioMin = hIni * 60 + mIni;
  const finMin = hFin * 60 + mFin;
  const horas: string[] = [];
  for (let t = inicioMin; t + pasoMin <= finMin; t += pasoMin) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
  return horas;
}

// El horario que ya estaba funcionando (definido por Carlos el 21-09-2026), como valor por defecto.
export const HORARIO_DEFAULT: HorarioAgenda = [
  { activo: false, horas: [] }, // Domingo
  { activo: true, horas: generarHoras("16:30", "20:00") }, // Lunes
  { activo: true, horas: generarHoras("16:30", "20:00") }, // Martes
  { activo: true, horas: generarHoras("16:30", "20:00") }, // Miércoles
  { activo: true, horas: generarHoras("16:30", "20:00") }, // Jueves
  { activo: true, horas: generarHoras("16:30", "20:00") }, // Viernes
  { activo: true, horas: generarHoras("09:00", "20:00") }, // Sábado
];

export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function horaValida(h: unknown): h is string {
  return typeof h === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(h);
}

function sanearHoras(horas: unknown): string[] {
  if (!Array.isArray(horas)) return [];
  const limpias = horas.filter(horaValida);
  return Array.from(new Set(limpias)).sort();
}

export function sanearHorario(data: unknown): HorarioAgenda {
  if (!Array.isArray(data) || data.length !== 7) return HORARIO_DEFAULT;
  return data.map((d, i) => {
    const base = HORARIO_DEFAULT[i];
    if (!d || typeof d !== "object") return base;
    const { activo, horas } = d as Partial<HorarioDia>;
    return {
      activo: typeof activo === "boolean" ? activo : base.activo,
      horas: horas !== undefined ? sanearHoras(horas) : base.horas,
    };
  }) as HorarioAgenda;
}

/** Texto breve para mostrar en el sitio, ej: "lunes a viernes 16:30–18:00, sábado 9:00–18:00". */
export function describirHorario(h: HorarioAgenda): string {
  const activos = h.map((d, i) => ({ ...d, dia: DIAS_SEMANA[i] })).filter((d) => d.activo && d.horas.length > 0);
  if (activos.length === 0) return "Sin días de atención configurados";
  const grupos: { dias: string[]; firma: string; rango: string }[] = [];
  for (const d of activos) {
    const firma = d.horas.join(",");
    const rango = d.horas.length > 1 ? `${d.horas[0]}–${d.horas[d.horas.length - 1]}` : d.horas[0];
    const g = grupos.find((g) => g.firma === firma);
    if (g) g.dias.push(d.dia); else grupos.push({ dias: [d.dia], firma, rango });
  }
  return grupos
    .map((g) => `${g.dias.length > 1 ? `${g.dias[0]} a ${g.dias[g.dias.length - 1]}` : g.dias[0]} ${g.rango}`)
    .join(", ");
}
