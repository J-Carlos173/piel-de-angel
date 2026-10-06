"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasAnalyticsConsent } from "@/lib/consent";

// Google Analytics 4. Solo carga si existe NEXT_PUBLIC_GA_ID y la persona aceptó cookies de análisis.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    setPermitido(hasAnalyticsConsent());
  }, []);

  if (!GA_ID || !permitido) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
