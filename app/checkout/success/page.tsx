"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrecio } from "@/data/productos";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const clearCart = useCartStore((s) => s.items);
  const { items } = useCartStore();

  const order = params.get("order") ?? "";
  const amount = parseInt(params.get("amount") ?? "0");
  const card = params.get("card") ?? "";
  const auth = params.get("auth") ?? "";

  // Vaciar carrito al llegar a esta página
  useEffect(() => {
    useCartStore.setState({ items: [] });
  }, []);

  return (
    <main className="checkout-result">
      <div className="checkout-result-card success">
        <div className="result-icon success">
          <i className="fa-solid fa-circle-check" />
        </div>
        <h1>¡Pago aprobado!</h1>
        <p className="result-subtitle">Tu compra fue procesada correctamente.</p>

        <div className="result-details">
          {order && (
            <div className="result-row">
              <span>Orden</span>
              <strong>{order}</strong>
            </div>
          )}
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

        <p className="result-next">
          <i className="fa-solid fa-whatsapp" style={{ color: "#25d366" }} />{" "}
          Nos contactaremos contigo por WhatsApp para coordinar el despacho.
        </p>

        <Link href="/#productos" className="btn-webpay">
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
