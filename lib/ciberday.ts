/**
 * Fin de la campaña Ciberday. Pasada esta hora, el banner, el carrusel y la página /ciberday se ocultan solos.
 * Tere pidió terminarla antes de lo previsto (pedidos #34 y #35, 9 oct 2026), así que se adelantó
 * del 11 de octubre a ahora mismo. El 11 de octubre ya no tiene efecto porque esta fecha quedó en el pasado.
 */
export const CIBERDAY_FIN = new Date("2026-10-09T10:55:00-03:00");

export function ciberdayActivo(ahora: number = Date.now()): boolean {
  return ahora <= CIBERDAY_FIN.getTime();
}

/** Días completos que quedan hasta el cierre (mínimo 1 mientras la campaña siga activa). */
export function ciberdayDiasRestantes(ahora: number = Date.now()): number {
  return Math.max(1, Math.ceil((CIBERDAY_FIN.getTime() - ahora) / 86_400_000));
}
