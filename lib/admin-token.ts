import { createHmac, timingSafeEqual } from "crypto";

/**
 * Valor de la cookie de sesión del panel: un HMAC derivado de la contraseña, no la
 * contraseña misma. Si alguien ve la cookie no puede recuperar la contraseña, y al
 * cambiar ADMIN_PASSWORD todas las sesiones anteriores dejan de valer.
 */
export function adminSessionToken(): string | null {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null; // sin contraseña configurada, nadie entra
  return createHmac("sha256", pass).update("admin-session-v1").digest("hex");
}

export function adminTokenValido(recibido: string | undefined | null): boolean {
  const esperado = adminSessionToken();
  if (!esperado || !recibido || recibido.length !== esperado.length) return false;
  return timingSafeEqual(Buffer.from(recibido), Buffer.from(esperado));
}
