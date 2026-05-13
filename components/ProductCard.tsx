"use client";

import { Producto, formatPrecio } from "@/data/productos";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({ p }: { p: Producto }) {
  const add = useCartStore((s) => s.add);
  const agotado = p.stock <= 0;
  const stockBajo = p.stock > 0 && p.stock <= 3;
  const stockClass = agotado ? "agotado" : stockBajo ? "bajo" : "";
  const stockTexto = agotado
    ? "Agotado"
    : stockBajo
    ? `¡Solo ${p.stock} disponibles!`
    : "En stock";

  return (
    <div className="producto-card reveal">
      {p.badge && (
        <span className={`producto-badge ${p.badge}`}>
          {p.badge === "bestseller" ? "Bestseller" : "Nuevo"}
        </span>
      )}

      <div className={`producto-img${agotado ? " agotado" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.img} alt={p.nombre} />
        {agotado && <div className="agotado-overlay">Agotado</div>}
      </div>

      <div className="producto-content">
        <div className="producto-categoria">{p.categoria}</div>
        <h3>{p.nombre}</h3>
        <p className="producto-desc">{p.descripcion}</p>
        <div className="producto-precio">{formatPrecio(p.precio)}</div>
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
