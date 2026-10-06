"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrecio } from "@/data/productos";
import { slugProducto } from "@/lib/slug";

type Promo = {
  id: number;
  tag: string;
  title: string;
  description: string;
  prizes: string[];
  cta: string;
  href: string;
  finalizado: boolean;
  producto_id: string | null;
};

type ProductoApi = {
  id: string;
  title: string;
  precio: number;
  precio_oferta: number | null;
  stock: number;
  thumbnail?: string;
};

export default function Promociones() {
  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [productos, setProductos] = useState<ProductoApi[]>([]);
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);

  useEffect(() => {
    fetch("/api/promos-web")
      .then((r) => r.json())
      .then((data) => setPromos(data.promos ?? []))
      .catch(() => setPromos([]));
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProductos(data.products ?? []))
      .catch(() => {});
  }, []);

  const hayCiberday = productos.length > 0 && (promos ?? []).some((p) => p.producto_id);

  // Mientras carga no se muestra nada (evita un parpadeo); si no hay promos activas, la sección desaparece.
  if (!promos || promos.length === 0) return null;

  return (
    <section className="promos-section" id="promociones">
      <div className="promos-container">
        <div className="section-header">
          <span className="section-tag">{hayCiberday ? "✦ Ciberday ✦" : "Ofertas & Concursos"}</span>
          <h2 className="section-title">{hayCiberday ? "Ofertas Ciberday" : "Promociones"}</h2>
          <p className="section-subtitle">
            {hayCiberday
              ? "Ciberday: precios rebajados por tiempo limitado en protectores solares y ojos y pestañas."
              : "Síguenos en Instagram para no perderte ninguna novedad"}
          </p>
        </div>

        <div className="promos-grid">
          {promos.map((p) => {
            const prod = p.producto_id ? productos.find((x) => x.id === p.producto_id) : undefined;
            if (p.producto_id && prod) {
              const tieneOferta = prod.precio_oferta != null && prod.precio_oferta > 0 && prod.precio_oferta < prod.precio;
              const precioVigente = tieneOferta ? prod.precio_oferta! : prod.precio;
              const agotado = prod.stock <= 0;
              return (
                <div key={p.id} className="promo-card promo-card-ciberday">
                  {p.tag && <span className="producto-badge-oferta" style={{ alignSelf: "flex-start", marginBottom: 8 }}>{p.tag}</span>}
                  {prod.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={prod.thumbnail} alt={prod.title} loading="lazy" decoding="async" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", borderRadius: 12, margin: "8px 0 12px", background: "#fff" }} />
                  )}
                  <h3 className="promo-title" style={{ fontSize: 17 }}>{prod.title}</h3>
                  <div className="pp-precio" style={{ margin: "6px 0 12px" }}>
                    {tieneOferta ? (
                      <>
                        <span className="pp-precio-original">{formatPrecio(prod.precio)}</span>{" "}
                        <span className="pp-precio-oferta">{formatPrecio(precioVigente)}</span>
                      </>
                    ) : (
                      <span className="pp-precio-normal">{formatPrecio(prod.precio)}</span>
                    )}
                  </div>
                  <a href={`/producto/${slugProducto(prod.title, prod.id)}`} className="promo-cta" style={{ marginBottom: 8 }}>
                    Ver producto
                  </a>
                  <button
                    type="button"
                    disabled={agotado}
                    onClick={() => { add(prod.id); openCart(); }}
                    className="promo-cta"
                    style={{ width: "100%", cursor: agotado ? "not-allowed" : "pointer", opacity: agotado ? 0.5 : 1, border: "none" }}
                  >
                    <i className="fa-solid fa-bag-shopping" /> {agotado ? "Agotado" : "Agregar al carrito"}
                  </button>
                </div>
              );
            }

            // Tarjeta de producto que todavía no carga: no se muestra en vez de parpadear como texto.
            if (p.producto_id) return null;

            return (
              <div key={p.id} className={`promo-card${p.finalizado ? " finished" : ""}`}>
                {p.finalizado && <span className="promo-badge-finished">Finalizado</span>}
                {p.tag && <span className="promo-tag">{p.tag}</span>}
                <h3 className="promo-title">{p.title}</h3>
                {p.description && <p className="promo-desc">{p.description}</p>}
                {p.prizes.length > 0 && (
                  <ul className="promo-prizes">
                    {p.prizes.map((prize) => (
                      <li key={prize}>
                        <span className="promo-prize-dot">✦</span> {prize}
                      </li>
                    ))}
                  </ul>
                )}
                {p.href && (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="promo-cta">
                    <i className="fa-brands fa-instagram" /> {p.cta}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
