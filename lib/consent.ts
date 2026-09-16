const CONSENT_KEY = "pieldeangel_cookie_consent";

export type ConsentValue = "aceptado" | "rechazado";

export function getConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "aceptado" || v === "rechazado" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
}

/** Usar esto antes de cargar cualquier script de análisis/publicidad (Meta Pixel, GA, etc). */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "aceptado";
}
