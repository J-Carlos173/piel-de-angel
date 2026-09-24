import { createHmac } from "crypto";
import jwt from "jsonwebtoken";

const CLAVE_ANTIGUA = "piel-de-angel-secret";
// Los enlaces de confirmar/rechazar ya enviados duran 7 días; hasta esta fecha se siguen aceptando.
const ANTIGUA_VALIDA_HASTA = Date.parse("2026-10-03T00:00:00-03:00");

/** BOOKING_SECRET si existe; si no, una clave derivada de ADMIN_PASSWORD (nunca una clave fija del código). */
export function bookingSecret(): string {
  if (process.env.BOOKING_SECRET) return process.env.BOOKING_SECRET;
  const base = process.env.ADMIN_PASSWORD;
  if (!base) throw new Error("Falta BOOKING_SECRET o ADMIN_PASSWORD");
  return createHmac("sha256", base).update("booking-v1").digest("hex");
}

export function firmarCita(payload: object): string {
  return jwt.sign(payload, bookingSecret(), { expiresIn: "7d" });
}

export function verificarCita<T>(token: string): T {
  try {
    return jwt.verify(token, bookingSecret()) as T;
  } catch (err) {
    if (!process.env.BOOKING_SECRET && Date.now() < ANTIGUA_VALIDA_HASTA) {
      return jwt.verify(token, CLAVE_ANTIGUA) as T;
    }
    throw err;
  }
}
