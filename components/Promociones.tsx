"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatPrecio } from "@/data/productos";
import { slugProducto } from "@/lib/slug";
import { ciberdayActivo } from "@/lib/ciberday";

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
  categoria?: string;
};

export default function Promociones() {
  const [promos, setPromos] = useState<Promo[] | null>(null);
  const [productos, setProductos] = useState<ProductoApi[]>([]);
  const carruselRef = useRef<HTMLDivElement>(null);
  const pausadoRef = useRef(false);
  const [categoria, setCategoria] = useState("Todas");
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

  const cibervigente = ciberdayActivo();
  // Avance automático en bucle: al llegar al final vuelve al inicio. Se pausa al pasar el mouse o tocar.
  useEffect(() => {
    const id = setInterval(() => {
      const el = carruselRef.current;
      if (!el || pausadoRef.current) return;
      const tarjeta = el.firstElementChild as HTMLElement | null;
      const paso = tarjeta ? tarjeta.offsetWidth + 20 : el.clientWidth * 0.8; // 20 = gap del carrusel
      const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (alFinal) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: paso, behavior: "smooth" });
    }, 4000);
    return () => clearInterval(id);
  }, [promos, categoria]);

  useEffect(() => {
    carruselRef.current?.scrollTo({ left: 0 });
  }, [categoria]);

  const hayCiberday = cibervigente && productos.length > 0 && (promos ?? []).some((p) => p.producto_id);

  // Mientras carga no se muestra nada (evita un parpadeo); si no hay promos activas, la sección desaparece.
  if (!promos || promos.length === 0) return null;

  // Tarjetas de producto con su producto ya cargado; las que aún no cargan no se muestran (evita parpadeo).
  const conProducto = !cibervigente ? [] : promos.flatMap((p) => {
    const prod = p.producto_id ? productos.find((x) => x.id === p.producto_id) : undefined;
    return prod ? [{ p, prod }] : [];
  });
  const categorias = Array.from(new Set(conProducto.map(({ prod }) => prod.categoria).filter(Boolean))) as string[];
  const visibles = categoria === "Todas" ? conProducto : conProducto.filter(({ prod }) => prod.categoria === categoria);
  const promosTexto = promos.filter((p) => !p.producto_id);
  if (!cibervigente && promosTexto.length === 0) return null;

  const desplazar = (dir: number) => {
    const el = carruselRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

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

        {conProducto.length > 0 && (
          <div className="ciber-carrusel-wrap">
            <div className="ciber-controles">
              {categorias.length > 1 && (
                <div className="ciber-chips">
                  {["Todas", ...categorias].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`ciber-chip${categoria === c ? " activo" : ""}`}
                      onClick={() => setCategoria(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="ciber-flecha" aria-label="Ver anteriores" onClick={() => desplazar(-1)}>
                <i className="fa-solid fa-chevron-left" />
              </button>
              <button type="button" className="ciber-flecha" aria-label="Ver siguientes" onClick={() => desplazar(1)}>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
            <div
              className="ciber-carrusel"
              ref={carruselRef}
              onMouseEnter={() => (pausadoRef.current = true)}
              onMouseLeave={() => (pausadoRef.current = false)}
              onTouchStart={() => (pausadoRef.current = true)}
              onTouchEnd={() => (pausadoRef.current = false)}
            >
              {visibles.map(({ p, prod }) => {
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
                    <h3 className="promo-title" style={{ fontSize: 16 }}>{prod.title}</h3>
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
              })}
            </div>
          </div>
        )}

        {promosTexto.length > 0 && (
          <div className="promos-grid">
            {promosTexto.map((p) => (
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
