// Sin nada de base de datos acá: este archivo lo puede importar tanto el servidor
// como componentes de cliente (el panel de horario).

export type HorarioDia = { activo: boolean; inicio: string; fin: string };
/** Índice 0=Domingo … 6=Sábado, igual que Date.getDay(). */
export type HorarioAgenda = HorarioDia[];

// El horario que ya estaba funcionando (definido por Carlos el 21-09-2026), como valor por defecto.
export const HORARIO_DEFAULT: HorarioAgenda = [
  { activo: false, inicio: "16:30", fin: "20:00" }, // Domingo
  { activo: true, inicio: "16:30", fin: "20:00" }, // Lunes
  { activo: true, inicio: "16:30", fin: "20:00" }, // Martes
  { activo: true, inicio: "16:30", fin: "20:00" }, // Miércoles
  { activo: true, inicio: "16:30", fin: "20:00" }, // Jueves
  { activo: true, inicio: "16:30", fin: "20:00" }, // Viernes
  { activo: true, inicio: "09:00", fin: "20:00" }, // Sábado
];

export const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function horaValida(h: unknown): h is string {
  return typeof h === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(h);
}

export function sanearHorario(data: unknown): HorarioAgenda {
  if (!Array.isArray(data) || data.length !== 7) return HORARIO_DEFAULT;
  return data.map((d, i) => {
    const base = HORARIO_DEFAULT[i];
    if (!d || typeof d !== "object") return base;
    const { activo, inicio, fin } = d as Partial<HorarioDia>;
    return {
      activo: typeof activo === "boolean" ? activo : base.activo,
      inicio: horaValida(inicio) ? inicio : base.inicio,
      fin: horaValida(fin) ? fin : base.fin,
    };
  }) as HorarioAgenda;
}

/** Texto legible para mostrar en el panel, ej: "lunes a viernes 16:30–20:00, sábado 9:00–20:00". */
export function describirHorario(h: HorarioAgenda): string {
  const activos = h.map((d, i) => ({ ...d, dia: DIAS_SEMANA[i] })).filter((d) => d.activo);
  if (activos.length === 0) return "Sin días de atención configurados";
  const grupos: { dias: string[]; inicio: string; fin: string }[] = [];
  for (const d of activos) {
    const g = grupos.find((g) => g.inicio === d.inicio && g.fin === d.fin);
    if (g) g.dias.push(d.dia); else grupos.push({ dias: [d.dia], inicio: d.inicio, fin: d.fin });
  }
  return grupos
    .map((g) => `${g.dias.length > 1 ? `${g.dias[0]} a ${g.dias[g.dias.length - 1]}` : g.dias[0]} ${g.inicio}–${g.fin}`)
    .join(", ");
}
