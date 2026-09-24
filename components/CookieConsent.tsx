"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, type ConsentValue } from "@/lib/consent";

export default function CookieConsent() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setChoice(getConsent());
    setMounted(true);
  }, []);

  if (pathname.startsWith("/admin")) return null;
  if (!mounted || choice !== null) return null;

  function elegir(valor: ConsentValue) {
    setConsent(valor);
    setChoice(valor);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Aviso de cookies">
      <p className="cookie-banner-texto">
        Usamos cookies esenciales para el sitio y el carro de compras. Sin publicidad por ahora.{" "}
        <Link href="/terminos#cookies">Más información</Link> · <Link href="/privacidad">Privacidad</Link>.
      </p>
      <div className="cookie-banner-botones">
        <button type="button" className="cookie-btn cookie-btn-outline" onClick={() => elegir("rechazado")}>
          Rechazar
        </button>
        <button type="button" className="cookie-btn cookie-btn-solido" onClick={() => elegir("aceptado")}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
