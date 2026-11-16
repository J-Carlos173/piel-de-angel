"use client";

import { useEffect } from "react";

// Cuenta los clics en cualquier enlace a WhatsApp del sitio público (un solo oyente,
// sin tocar cada botón). Guarda solo la página y qué botón fue; ver /api/track/clic.
export default function ClickTracker() {
  useEffect(() => {
    function alClic(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href*='wa.me']");
      if (!a) return;
      const path = window.location.pathname;
      if (path.startsWith("/admin")) return;
      const origen = a.classList.contains("whatsapp-float")
        ? "flotante"
        : a.closest("footer")
          ? "pie"
          : "contenido";
      fetch("/api/track/clic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, origen }),
        keepalive: true,
      }).catch(() => {});
    }
    document.addEventListener("click", alClic);
    return () => document.removeEventListener("click", alClic);
  }, []);

  return null;
}
