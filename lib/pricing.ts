export const COSTO_ENVIO = 2990;
export const GRATIS_SANTIAGO = 40000;

export type ZonaEnvio = "santiago" | "regiones";

export function esZonaValida(z: unknown): z is ZonaEnvio {
  return z === "santiago" || z === "regiones";
}

/** Regiones: no se cobra en el checkout, se paga al transportista al recibirlo. */
export function calcularEnvio(subtotal: number, zona: ZonaEnvio): number {
  if (zona === "regiones") return 0;
  return subtotal >= GRATIS_SANTIAGO ? 0 : COSTO_ENVIO;
}
