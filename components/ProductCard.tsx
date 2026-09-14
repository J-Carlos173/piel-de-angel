"use client";

import { useState } from "react";
import { Producto, formatPrecio, precioFinal } from "@/data/productos";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({ p }: { p: Producto }) {
  const add = useCartStore((s) => s.add);
  const [showDesc, setShowDesc] = useState(false);
  const agotado = p.stock <= 0;
  const stockBajo = p.stock > 0 && p.stock <= 3;
  const stockClass = agotado ? "agotado" : stockBajo ? "bajo" : "";
  const stockTexto = agotado
    ? "Agotado"
    : stockBajo
    ? `¡Solo ${p.stock} disponibles!`
    : "En stock";

  const precioConDescuento = precioFinal(p);
  const enOferta = precioConDescuento < p.precio;
  const ahorroPct = enOferta ? Math.round((1 - precioConDescuento / p.precio) * 100) : 0;

  return (
    <div className="producto-card reveal">
      {p.badge && (
        <span className={`producto-badge ${p.badge}`}>
          {p.badge === "bestseller" ? "Bestseller" : "Nuevo"}
        </span>
      )}
      {enOferta && (
        <span className="producto-badge-oferta">Ahorra {ahorroPct}%</span>
      )}

      <div className={`producto-img${agotado ? " agotado" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.img} alt={p.nombre} />
        {agotado && <div className="agotado-overlay">Agotado</div>}
      </div>

      <div className="producto-content">
        <div className="producto-categoria">{p.categoria}</div>
        <h3>{p.nombre}</h3>

        <button
          type="button"
          className="producto-desc-toggle"
          onClick={() => setShowDesc((v) => !v)}
        >
          {showDesc ? "Ocultar detalles" : "Ver detalles"}
          <i className={`fa-solid fa-chevron-${showDesc ? "up" : "down"}`} />
        </button>
        {showDesc && <p className="producto-desc">{p.descripcion}</p>}

        <div className="producto-precio">
          {enOferta ? (
            <>
              <span className="producto-precio-original">{formatPrecio(p.precio)}</span>
              <span className="producto-precio-oferta">{formatPrecio(precioConDescuento)}</span>
            </>
          ) : (
            formatPrecio(p.precio)
          )}
        </div>

        <div className={`producto-stock${stockClass ? ` ${stockClass}` : ""}`}>
          <i className="fa-solid fa-circle" /> {stockTexto}
        </div>
        <button
          className="btn-add-cart"
          disabled={agotado}
          onClick={() => add(p.id)}
        >
          {agotado ? (
            <>
              <i className="fa-solid fa-ban" /> No disponible
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus" /> Agregar al carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}
