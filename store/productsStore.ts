"use client";

import { create } from "zustand";
import { Producto, PRODUCTOS } from "@/data/productos";
import { useCartStore } from "./cartStore";

interface ProductsStore {
  products: Producto[];
  setProducts: (p: Producto[]) => void;
  findById: (id: string) => Producto | undefined;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: PRODUCTOS,
  setProducts: (products) => {
    set({ products });
    const validIds = new Set(products.map((p) => p.id));
    const cartItems = useCartStore.getState().items;
    const cleaned = cartItems.filter((i) => validIds.has(i.id));
    if (cleaned.length !== cartItems.length) {
      useCartStore.setState({ items: cleaned });
    }
  },
  findById: (id) => get().products.find((p) => p.id === id),
}));
