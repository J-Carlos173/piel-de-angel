"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const REASONS: Record<string, string> = {
  cancelled: "Cancelaste el pago en WebPay.",
  rejected: "El pago fue rechazado por el banco. Verifica tus datos o intenta con otra tarjeta.",
  timeout: "La sesión de pago expiró. Intenta de nuevo.",
  error: "Ocurrió un error al procesar el pago. Intenta de nuevo.",
};

function FailedContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "error";
  const message = REASONS[reason] ?? REASONS.error;

  return (
    <main className="checkout-result">
      <div className="checkout-result-card failed">
        <div className="result-icon failed">
          <i className="fa-solid fa-circle-xmark" />
        </div>
        <h1>Pago no completado</h1>
        <p className="result-subtitle">{message}</p>

        <div className="result-actions">
          <Link href="/checkout" className="btn-webpay">
            <i className="fa-solid fa-rotate-left" /> Intentar de nuevo
          </Link>
          <Link href="/#productos" className="btn-secondary-outline">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function FailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  );
}
