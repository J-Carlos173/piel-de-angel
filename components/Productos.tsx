"use client";

import { useEffect, useState } from "react";
import { fetchProductos } from "@/lib/medusa";
import { useProductsStore } from "@/store/productsStore";
import ProductCard from "./ProductCard";
import { useReveal } from "@/hooks/useReveal";
import { PRODUCTOS, type Producto } from "@/data/productos";

type GridSize = "compact" | "mini";

export default function Productos() {
  const { setProducts } = useProductsStore();
  const [allProducts, setAllProducts] = useState<Producto[]>(PRODUCTOS);
  const [activeTab, setActiveTab] = useState("Todos");
  const [gridSize, setGridSize] = useState<GridSize>("compact");
  const ref = useReveal([allProducts, activeTab]);

  useEffect(() => {
    fetchProductos().then((remote) => {
      if (remote.length > 0) {
        setProducts(remote);
        setAllProducts(remote);
      }
    });
  }, [setProducts]);

  const categorias = ["Todos", ...Array.from(new Set(allProducts.map((p) => p.categoria))).filter(Boolean)];
  const visible = activeTab === "Todos" ? allProducts : allProducts.filter((p) => p.categoria === activeTab);

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

        <div className="productos-toolbar reveal">
          <div className="productos-tabs">
            {categorias.map((cat) => (
              <button
                key={cat}
                className={`tab-btn${activeTab === cat ? " active" : ""}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid-size-toggle">
            <button
              className={`grid-size-btn${gridSize === "compact" ? " active" : ""}`}
              onClick={() => setGridSize("compact")}
              title="Vista compacta"
            >
              <i className="fa-solid fa-grip" />
            </button>
            <button
              className={`grid-size-btn${gridSize === "mini" ? " active" : ""}`}
              onClick={() => setGridSize("mini")}
              title="Vista mini"
            >
              <i className="fa-solid fa-border-all" />
            </button>
          </div>
        </div>

        <div className={`productos-grid ${gridSize}`}>
          {visible.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
