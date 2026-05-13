"use client";

import { useEffect } from "react";
import { fetchProductos } from "@/lib/medusa";
import { useProductsStore } from "@/store/productsStore";
import ProductCard from "./ProductCard";
import { useReveal } from "@/hooks/useReveal";

export default function Productos() {
  const { products, setProducts } = useProductsStore();
  const ref = useReveal([products]);

  useEffect(() => {
    fetchProductos().then((remote) => {
      if (remote.length > 0) setProducts(remote);
    });
  }, [setProducts]);

  return (
    <section className="productos" id="productos" ref={ref}>
      <div className="container">
        <div className="section-header reveal">
          <span className="eyebrow">Nuestra Tienda</span>
          <h2 className="section-title">
            Skincare <em>Premium</em>
          </h2>
          <p className="section-subtitle">
            Una selección curada de cosmética de alta gama para que cada día sea un
            ritual de cuidado. Compra fácil y rápido por WhatsApp.
          </p>
        </div>

        <div className="productos-grid">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
