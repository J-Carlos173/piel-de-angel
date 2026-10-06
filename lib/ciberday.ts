/** Fin de la campaña Ciberday (domingo 11 de octubre 2026, hora de Chile). Pasada esta hora, el banner y las tarjetas Ciberday se ocultan solos. */
export const CIBERDAY_FIN = new Date("2026-10-11T23:59:59-03:00");

export function ciberdayActivo(ahora: number = Date.now()): boolean {
  return ahora <= CIBERDAY_FIN.getTime();
}

/** Días completos que quedan hasta el cierre (mínimo 1 mientras la campaña siga activa). */
export function ciberdayDiasRestantes(ahora: number = Date.now()): number {
  return Math.max(1, Math.ceil((CIBERDAY_FIN.getTime() - ahora) / 86_400_000));
}
