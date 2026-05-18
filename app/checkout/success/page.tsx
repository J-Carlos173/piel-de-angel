"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrecio } from "@/data/productos";

const WA_NUMBER = "56977031461";

function SuccessContent() {
  const params = useSearchParams();
  const order  = params.get("order")  ?? "";
  const amount = parseInt(params.get("amount") ?? "0");
  const card   = params.get("card")   ?? "";
  const auth   = params.get("auth")   ?? "";

  useEffect(() => {
    useCartStore.setState({ items: [] });
  }, []);

  const waText = encodeURIComponent(
    `Hola, ya pagué mi pedido *${order}* en Piel de Ángel. ¿Pueden confirmarme el despacho? 🌸`
  );
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${waText}`;

  return (
    <main className="checkout-result">
      <div className="checkout-result-card success">

        <div className="result-icon success">
          <i className="fa-solid fa-circle-check" />
        </div>

        <h1>¡Pago aprobado!</h1>
        <p className="result-subtitle">Tu compra fue procesada correctamente.<br/>Te enviaremos un correo con el detalle.</p>

        {order && (
          <div className="result-order-badge">
            <span className="result-order-label">Número de orden</span>
            <span className="result-order-id">{order}</span>
          </div>
        )}

        <div className="result-details">
          {amount > 0 && (
            <div className="result-row">
              <span>Total pagado</span>
              <strong>{formatPrecio(amount)}</strong>
            </div>
          )}
          {card && (
            <div className="result-row">
              <span>Tarjeta</span>
              <strong>**** **** **** {card}</strong>
            </div>
          )}
          {auth && (
            <div className="result-row">
              <span>Código autorización</span>
              <strong>{auth}</strong>
            </div>
          )}
        </div>

        <div className="result-next-steps">
          <p className="result-next-title">¿Qué sigue?</p>
          <p className="result-next-text">
            Escríbenos por WhatsApp con tu número de orden para coordinar el despacho más rápido.
          </p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-success">
            <i className="fa-brands fa-whatsapp" />
            Escríbenos por WhatsApp — {order}
          </a>
        </div>

        <Link href="/#productos" className="btn-seguir-comprando">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
