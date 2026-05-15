"use client";

import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useProductsStore } from "@/store/productsStore";
import { formatPrecio } from "@/data/productos";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalAmount } = useCartStore();
  const products = useProductsStore((s) => s.products);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const webpayFormRef = useRef<HTMLFormElement>(null);
  const [webpay, setWebpay] = useState<{ url: string; token: string } | null>(null);

  // Siempre mostrar desde arriba al entrar a esta página
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const total = totalAmount();
  const lineItems = items
    .map((item) => {
      const prod = products.find((p) => p.id === item.id);
      if (!prod) return null;
      return { ...prod, qty: item.qty };
    })
    .filter(Boolean) as Array<{ id: string; nombre: string; precio: number; qty: number }>;

  async function handlePagar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const customer = {
      nombre: fd.get("nombre") as string,
      email: fd.get("email") as string,
      telefono: fd.get("telefono") as string,
    };

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineItems, customer }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Error al iniciar el pago. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      setWebpay({ url: data.url, token: data.token });
      // Submit the hidden WebPay form after state update
      setTimeout(() => webpayFormRef.current?.submit(), 100);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <i className="fa-solid fa-bag-shopping" />
          <h2>Tu carrito está vacío</h2>
          <Link href="/#productos" className="btn-webpay">Ver productos</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <Link href="/" className="checkout-back">
            <i className="fa-solid fa-arrow-left" /> Volver
          </Link>
          <h1>Finalizar compra</h1>
        </div>

        <div className="checkout-grid">
          {/* Formulario de contacto */}
          <section className="checkout-form-section">
            <h2>Datos de contacto</h2>
            <form ref={formRef} onSubmit={handlePagar} className="checkout-form">
              <label>
                Nombre completo
                <input name="nombre" type="text" required placeholder="María González" />
              </label>
              <label>
                Correo electrónico
                <input name="email" type="email" required placeholder="correo@ejemplo.com" />
              </label>
              <label>
                Teléfono
                <input name="telefono" type="tel" required placeholder="+56 9 1234 5678" />
              </label>

              {error && <p className="checkout-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

              <button type="submit" className="btn-webpay" disabled={loading}>
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Conectando con WebPay...</>
                ) : (
                  <><i className="fa-solid fa-lock" /> Pagar {formatPrecio(total)} con WebPay</>
                )}
              </button>
              <p className="checkout-secure-note">
                <i className="fa-solid fa-shield-halved" /> Pago 100% seguro con Transbank WebPay
              </p>
            </form>
          </section>

          {/* Resumen del pedido */}
          <section className="checkout-summary">
            <h2>Resumen del pedido</h2>
            <div className="checkout-items">
              {lineItems.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <span className="checkout-item-name">
                    {item.nombre} <span className="checkout-item-qty">×{item.qty}</span>
                  </span>
                  <span className="checkout-item-price">{formatPrecio(item.precio * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-total">
              <span>Total a pagar</span>
              <span className="checkout-total-amount">{formatPrecio(total)}</span>
            </div>
            <p className="checkout-despacho-note">
              <i className="fa-solid fa-circle-info" /> El despacho se coordina por WhatsApp tras confirmar el pago.
            </p>
          </section>
        </div>
      </div>

      {/* Formulario oculto que redirige a WebPay */}
      {webpay && (
        <form ref={webpayFormRef} method="POST" action={webpay.url} style={{ display: "none" }}>
          <input type="hidden" name="token_ws" value={webpay.token} />
        </form>
      )}
    </main>
  );
}
