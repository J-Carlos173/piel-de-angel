"use client";

import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useProductsStore } from "@/store/productsStore";
import { formatPrecio } from "@/data/productos";
import Link from "next/link";

const COSTO_ENVIO = 2990;
const GRATIS_SANTIAGO = 39990;
const GRATIS_REGIONES = 49990;

function calcularEnvio(subtotal: number, zona: "santiago" | "regiones"): number {
  if (zona === "santiago" && subtotal >= GRATIS_SANTIAGO) return 0;
  if (zona === "regiones" && subtotal >= GRATIS_REGIONES) return 0;
  return COSTO_ENVIO;
}

export default function CheckoutPage() {
  const { items, totalAmount } = useCartStore();
  const products = useProductsStore((s) => s.products);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zona, setZona] = useState<"santiago" | "regiones">("santiago");
  const webpayFormRef = useRef<HTMLFormElement>(null);
  const [webpay, setWebpay] = useState<{ url: string; token: string } | null>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const subtotal = totalAmount();
  const envio = calcularEnvio(subtotal, zona);
  const total = subtotal + envio;

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
        body: JSON.stringify({ items: lineItems, customer, envio, zona }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Error al iniciar el pago. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      setWebpay({ url: data.url, token: data.token });
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

  const faltaParaGratis =
    zona === "santiago"
      ? Math.max(0, GRATIS_SANTIAGO - subtotal)
      : Math.max(0, GRATIS_REGIONES - subtotal);

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
          {/* Formulario */}
          <section className="checkout-form-section">
            <h2>Datos de contacto</h2>
            <form onSubmit={handlePagar} className="checkout-form">
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

              {error && (
                <p className="checkout-error">
                  <i className="fa-solid fa-circle-exclamation" /> {error}
                </p>
              )}

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

          {/* Resumen */}
          <section className="checkout-summary">
            <h2>Resumen del pedido</h2>

            {/* Selector de zona */}
            <div className="checkout-zona">
              <p className="checkout-zona-label">¿Dónde te lo enviamos?</p>
              <div className="checkout-zona-btns">
                <button
                  type="button"
                  className={`zona-btn${zona === "santiago" ? " active" : ""}`}
                  onClick={() => setZona("santiago")}
                >
                  <i className="fa-solid fa-city" /> Santiago
                </button>
                <button
                  type="button"
                  className={`zona-btn${zona === "regiones" ? " active" : ""}`}
                  onClick={() => setZona("regiones")}
                >
                  <i className="fa-solid fa-map-location-dot" /> Regiones
                </button>
              </div>
              {zona === "regiones" && (
                <p className="checkout-zona-info">
                  Blue Express · Copiapó hasta Puerto Montt
                </p>
              )}
            </div>

            <div className="checkout-items">
              {lineItems.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <span className="checkout-item-name">
                    {item.nombre} <span className="checkout-item-qty">×{item.qty}</span>
                  </span>
                  <span className="checkout-item-price">{formatPrecio(item.precio * item.qty)}</span>
                </div>
              ))}

              {/* Envío */}
              <div className="checkout-item checkout-item-envio">
                <span className="checkout-item-name">
                  <i className="fa-solid fa-truck" /> Envío
                </span>
                {envio === 0 ? (
                  <span className="checkout-envio-gratis">¡Gratis!</span>
                ) : (
                  <span className="checkout-item-price">{formatPrecio(envio)}</span>
                )}
              </div>
            </div>

            {/* Banner: cuánto falta para envío gratis */}
            {faltaParaGratis > 0 && (
              <div className="checkout-envio-banner">
                <i className="fa-solid fa-truck" />
                Te faltan <strong>{formatPrecio(faltaParaGratis)}</strong> para envío gratis
              </div>
            )}
            {faltaParaGratis === 0 && envio === 0 && (
              <div className="checkout-envio-banner gratis">
                <i className="fa-solid fa-circle-check" /> ¡Envío gratis aplicado!
              </div>
            )}

            <div className="checkout-total">
              <span>Total a pagar</span>
              <span className="checkout-total-amount">{formatPrecio(total)}</span>
            </div>
          </section>
        </div>
      </div>

      {webpay && (
        <form ref={webpayFormRef} method="POST" action={webpay.url} style={{ display: "none" }}>
          <input type="hidden" name="token_ws" value={webpay.token} />
        </form>
      )}
    </main>
  );
}
