"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Producto, formatPrecio, precioFinal, WHATSAPP_NUMERO } from "@/data/productos";
import { useCartStore } from "@/store/cartStore";

function stockLabel(stock: number): string {
  if (stock <= 0) return "Agotado";
  if (stock <= 3) return "¡Pocas unidades!";
  return "En stock";
}

function ProductModal({ p, onClose }: { p: Producto; onClose: () => void }) {
  const add = useCartStore((s) => s.add);
  const agotado = p.stock <= 0;
  const stockBajo = p.stock > 0 && p.stock <= 3;
  const stockClass = agotado ? "agotado" : stockBajo ? "bajo" : "";
  const stockTexto = stockLabel(p.stock);

  const precioConDescuento = precioFinal(p);
  const enOferta = precioConDescuento < p.precio;
  const ahorroPct = enOferta ? Math.round((1 - precioConDescuento / p.precio) * 100) : 0;

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="producto-modal-overlay" onClick={onClose}>
      <div className="producto-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="producto-modal-close" onClick={onClose} aria-label="Cerrar">
          <i className="fa-solid fa-xmark" />
        </button>

        <div className={`producto-modal-img${agotado ? " agotado" : ""}`}>
          <div className="producto-badges">
            {p.badge && (
              <span className={`producto-badge ${p.badge}`}>
                {p.badge === "bestseller" ? "Bestseller" : "Nuevo"}
              </span>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.img} alt={p.nombre} />
          {agotado && <div className="agotado-overlay">Agotado</div>}
        </div>

        <div className="producto-modal-content">
          <div className="producto-categoria">{p.categoria}</div>
          <h2>{p.nombre}</h2>
          <p className="producto-modal-desc">{p.descripcion}</p>

          {enOferta && <span className="producto-badge-oferta">Ahorra {ahorroPct}%</span>}
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
            onClick={() => { add(p.id); onClose(); }}
          >
            {agotado ? (
              <><i className="fa-solid fa-ban" /> No disponible</>
            ) : (
              <><i className="fa-solid fa-plus" /> Agregar al carrito</>
            )}
          </button>

          <a
            className="producto-modal-wa"
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(`Hola, me interesa "${p.nombre}". ¿Me puedes dar más información?`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-brands fa-whatsapp" /> Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProductCard({ p }: { p: Producto }) {
  const add = useCartStore((s) => s.add);
  const [modalOpen, setModalOpen] = useState(false);
  const agotado = p.stock <= 0;
  const stockBajo = p.stock > 0 && p.stock <= 3;
  const stockClass = agotado ? "agotado" : stockBajo ? "bajo" : "";
  const stockTexto = stockLabel(p.stock);

  const precioConDescuento = precioFinal(p);
  const enOferta = precioConDescuento < p.precio;
  const ahorroPct = enOferta ? Math.round((1 - precioConDescuento / p.precio) * 100) : 0;

  return (
    <>
      <div className="producto-card reveal" onClick={() => setModalOpen(true)} style={{ cursor: "pointer" }}>
        <div className="producto-badges">
          {p.badge && (
            <span className={`producto-badge ${p.badge}`}>
              {p.badge === "bestseller" ? "Bestseller" : "Nuevo"}
            </span>
          )}
        </div>

        <div className={`producto-img${agotado ? " agotado" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.img} alt={p.nombre} loading="lazy" decoding="async" />
          {agotado && <div className="agotado-overlay">Agotado</div>}
        </div>

        <div className="producto-content">
          <div className="producto-categoria">{p.categoria}</div>
          <h3>{p.nombre}</h3>

          {enOferta && (
            <span className="producto-badge-oferta">Ahorra {ahorroPct}%</span>
          )}
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
            onClick={(e) => { e.stopPropagation(); add(p.id); }}
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

      {modalOpen && <ProductModal p={p} onClose={() => setModalOpen(false)} />}
    </>
  );
}
