"use client";

import { useState, useRef, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useProductsStore } from "@/store/productsStore";
import { formatPrecio } from "@/data/productos";
import Link from "next/link";

const COSTO_ENVIO = 2990;
const GRATIS_SANTIAGO = 40000;
const WEBPAY_PLUS_ACTIVO = true; // false = link simple webpay.cl | true = WebPay Plus API
const WEBPAY_SIMPLE_URL = "https://www.webpay.cl/form-pay/294463";

function esSabado(): boolean {
  return new Date().getDay() === 6;
}

function calcularEnvio(subtotal: number, zona: "santiago" | "regiones"): number {
  if (zona === "santiago" && esSabado() && subtotal >= GRATIS_SANTIAGO) return 0;
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
  const [hydrated, setHydrated] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoValido, setPromoValido] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  useEffect(() => { setHydrated(true); }, []);

  const subtotal = totalAmount();
  const envio = calcularEnvio(subtotal, zona);
  const descuento = promoValido?.discount ?? 0;
  const total = Math.max(0, subtotal + envio - descuento);
  const sabado = esSabado();
  const faltaParaGratis = zona === "santiago" && sabado
    ? Math.max(0, GRATIS_SANTIAGO - subtotal)
    : -1;

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
      direccion: fd.get("direccion") as string,
      depto: fd.get("depto") as string,
      ciudad: fd.get("ciudad") as string,
      region: fd.get("region") as string,
    };

    try {
      if (!WEBPAY_PLUS_ACTIVO) {
        await fetch("/api/checkout/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lineItems, customer, envio, total, zona }),
        });
        window.open(WEBPAY_SIMPLE_URL, "_blank");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineItems, customer, envio, zona, promoCode: promoValido?.code ?? "" }),
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

  async function aplicarPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoValido(null);
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoValido({ code: data.code, discount: data.discount });
      } else {
        setPromoError(data.error ?? "Código inválido");
      }
    } catch {
      setPromoError("Error al validar el código");
    } finally {
      setPromoLoading(false);
    }
  }

  if (!hydrated) return null;

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
          {/* Formulario */}
          <section className="checkout-form-section">
            <form onSubmit={handlePagar} className="checkout-form">
              <h2>Datos de contacto</h2>
              <label>
                Nombre completo
                <input name="nombre" type="text" required placeholder="María González" />
              </label>
              <div className="form-row-2">
                <label>
                  Correo electrónico
                  <input name="email" type="email" required placeholder="correo@ejemplo.com" />
                </label>
                <label>
                  Teléfono
                  <input name="telefono" type="tel" required placeholder="+56 9 1234 5678" />
                </label>
              </div>

              <h2 style={{ marginTop: "8px" }}>Dirección de despacho</h2>
              <label>
                Calle y número
                <input name="direccion" type="text" required placeholder="Av. Providencia 1234" />
              </label>
              <label>
                Depto / Casa / Block <span className="label-opcional">(opcional)</span>
                <input name="depto" type="text" placeholder="Depto 5B" />
              </label>
              <div className="form-row-2">
                <label>
                  Ciudad
                  <input name="ciudad" type="text" required placeholder="Santiago" />
                </label>
                <label>
                  Región
                  <input name="region" type="text" required placeholder="Región Metropolitana" />
                </label>
              </div>

              {/* Términos y condiciones */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={terminos}
                  onChange={(e) => setTerminos(e.target.checked)}
                  style={{ marginTop: 3, accentColor: "var(--rosa-deep)", width: 16, height: 16, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: "var(--texto-soft)", lineHeight: 1.5 }}>
                  He leído y acepto los{" "}
                  <Link href="/terminos" target="_blank" style={{ color: "var(--rosa-deep)", textDecoration: "underline" }}>
                    Términos y Condiciones
                  </Link>
                  {" "}y la política de despacho y devoluciones.
                </span>
              </label>

              {error && (
                <p className="checkout-error">
                  <i className="fa-solid fa-circle-exclamation" /> {error}
                </p>
              )}

              <button type="submit" className="btn-webpay" disabled={loading || !terminos}>
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin" /> Preparando pedido...</>
                ) : (
                  <><i className="fa-solid fa-credit-card" /> Pagar {formatPrecio(total)} con Webpay</>
                )}
              </button>

              {!WEBPAY_PLUS_ACTIVO && (
                <button type="button" className="btn-webpay btn-webpay-proximamente" disabled>
                  <i className="fa-solid fa-lock" /> WebPay Plus — Próximamente
                </button>
              )}

              <p className="checkout-secure-note">
                <i className="fa-solid fa-shield-halved" /> Pago 100% seguro con Transbank WebPay
              </p>
            </form>
          </section>

          {/* Resumen */}
          <section className="checkout-summary">
            <h2>Resumen del pedido</h2>

            {/* Selector zona */}
            <div className="checkout-zona">
              <p className="checkout-zona-label">¿Dónde te lo enviamos?</p>
              <div className="checkout-zona-btns">
                <button type="button" className={`zona-btn${zona === "santiago" ? " active" : ""}`} onClick={() => setZona("santiago")}>
                  <i className="fa-solid fa-city" /> Santiago
                </button>
                <button type="button" className={`zona-btn${zona === "regiones" ? " active" : ""}`} onClick={() => setZona("regiones")}>
                  <i className="fa-solid fa-map-location-dot" /> Regiones
                </button>
              </div>
              {zona === "santiago" && (
                <p className="checkout-zona-info">
                  Solo Santiago Urbano · círculo Américo Vespucio
                  {!sabado && <> · <strong>Despacho los sábados</strong></>}
                </p>
              )}
              {zona === "regiones" && (
                <p className="checkout-zona-info">
                  Blue Express o Starken · Copiapó hasta Puerto Montt
                </p>
              )}
            </div>

            {/* Items */}
            <div className="checkout-items">
              {lineItems.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <span className="checkout-item-name">
                    {item.nombre} <span className="checkout-item-qty">×{item.qty}</span>
                  </span>
                  <span className="checkout-item-price">{formatPrecio(item.precio * item.qty)}</span>
                </div>
              ))}
              <div className="checkout-item checkout-item-envio">
                <span className="checkout-item-name">
                  <i className="fa-solid fa-truck" /> Envío
                </span>
                {envio === 0
                  ? <span className="checkout-envio-gratis">¡Gratis!</span>
                  : <span className="checkout-item-price">{formatPrecio(envio)}</span>
                }
              </div>
            </div>

            {/* Banners */}
            {zona === "santiago" && !sabado && (
              <div className="checkout-envio-banner sabado">
                <i className="fa-solid fa-calendar-day" />
                Despacho en Santiago solo los <strong>sábados</strong>. Tu pedido llegará el próximo sábado.
              </div>
            )}
            {zona === "santiago" && sabado && faltaParaGratis > 0 && (
              <div className="checkout-envio-banner">
                <i className="fa-solid fa-truck" />
                Te faltan <strong>{formatPrecio(faltaParaGratis)}</strong> para envío gratis
              </div>
            )}
            {envio === 0 && (
              <div className="checkout-envio-banner gratis">
                <i className="fa-solid fa-circle-check" /> ¡Envío gratis aplicado!
              </div>
            )}

            {/* Código de descuento */}
            <div style={{ margin: "12px 0", padding: "14px", background: "rgba(198,138,149,0.06)", borderRadius: 12, border: "1px solid rgba(198,138,149,0.2)" }}>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--texto-soft)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                <i className="fa-solid fa-tag" style={{ marginRight: 6 }} />Código de descuento
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="MESDELAMAMA"
                  value={promoInput}
                  disabled={!!promoValido}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && aplicarPromo()}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--borde-suave, #e0d0d0)", fontSize: 13, fontFamily: "Montserrat, sans-serif", outline: "none", background: promoValido ? "#f0f9f0" : "white", color: "#333" }}
                />
                {promoValido ? (
                  <button
                    type="button"
                    onClick={() => { setPromoValido(null); setPromoInput(""); setPromoError(""); }}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e57373", background: "transparent", color: "#e57373", fontSize: 12, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={aplicarPromo}
                    disabled={promoLoading || !promoInput.trim()}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--rosa-deep, #C68A95)", color: "white", fontSize: 13, cursor: "pointer", fontFamily: "Montserrat, sans-serif", opacity: promoLoading || !promoInput.trim() ? 0.6 : 1 }}
                  >
                    {promoLoading ? <i className="fa-solid fa-spinner fa-spin" /> : "Aplicar"}
                  </button>
                )}
              </div>
              {promoError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#e57373", fontFamily: "Montserrat, sans-serif" }}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: 4 }} />{promoError}</p>}
              {promoValido && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#4caf50", fontFamily: "Montserrat, sans-serif" }}><i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} />¡Código aplicado! −{formatPrecio(promoValido.discount)}</p>}
            </div>

            {descuento > 0 && (
              <div className="checkout-item" style={{ color: "#4caf50" }}>
                <span className="checkout-item-name">
                  <i className="fa-solid fa-tag" /> Descuento ({promoValido?.code})
                </span>
                <span>−{formatPrecio(descuento)}</span>
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
