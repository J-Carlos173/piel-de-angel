"use client";

import { useCartStore } from "@/store/cartStore";
import { formatPrecio } from "@/data/productos";
import { useProductsStore } from "@/store/productsStore";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, isOpen, close, remove, updateQty, checkout, totalItems, totalAmount } =
    useCartStore();
  const products = useProductsStore((s) => s.products);
  const router = useRouter();

  const count = totalItems();
  const total = totalAmount();

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? " active" : ""}`}
        onClick={close}
      />
      <aside className={`cart-drawer${isOpen ? " active" : ""}`}>
        <div className="cart-header">
          <h3>
            Tu <em>carrito</em>
          </h3>
          <button className="cart-close" onClick={close} aria-label="Cerrar carrito">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <i className="fa-solid fa-bag-shopping" />
              <p>Tu carrito está vacío</p>
              <small>Agrega productos para comenzar</small>
            </div>
          ) : (
            items.map((item) => {
              const prod = products.find((p) => p.id === item.id);
              if (!prod) return null;
              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prod.img} alt={prod.nombre} />
                  </div>
                  <div className="cart-item-info">
                    <h4>{prod.nombre}</h4>
                    <div className="cart-item-price">
                      {formatPrecio(prod.precio * item.qty)}
                    </div>
                    <div className="cart-item-qty">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.id, -1)}
                      >
                        <i className="fa-solid fa-minus" />
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        className="qty-btn"
                        disabled={item.qty >= prod.stock}
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <i className="fa-solid fa-plus" />
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => remove(item.id)}
                    aria-label="Eliminar"
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Productos</span>
              <span>{count} {count === 1 ? "ítem" : "ítems"}</span>
            </div>
            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">{formatPrecio(total)}</span>
            </div>
            <button
              className="btn-checkout btn-webpay-drawer"
              onClick={() => { close(); router.push("/checkout"); }}
            >
              <i className="fa-solid fa-lock" /> Pagar con WebPay
            </button>
            <button className="btn-checkout-secondary" onClick={checkout}>
              <i className="fa-brands fa-whatsapp" /> Consultar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
