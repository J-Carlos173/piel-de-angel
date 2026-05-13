"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatPrecio, WHATSAPP_NUMERO } from "@/data/productos";
import { useProductsStore } from "./productsStore";

interface CartItem {
  id: string;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  toast: string | null;

  open: () => void;
  close: () => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  checkout: () => void;

  totalItems: () => number;
  totalAmount: () => number;
}

const getProducts = () => useProductsStore.getState().products;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toast: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      add: (id) => {
        const prod = getProducts().find((p) => p.id === id);
        if (!prod || prod.stock <= 0) return;

        const items = get().items;
        const existing = items.find((i) => i.id === id);

        if (existing) {
          if (existing.qty >= prod.stock) {
            set({ toast: `Solo hay ${prod.stock} unidades disponibles` });
            setTimeout(() => set({ toast: null }), 2800);
            return;
          }
          set({
            items: items.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i),
            toast: `${prod.nombre} (${existing.qty + 1})`,
            isOpen: true,
          });
        } else {
          set({
            items: [...items, { id, qty: 1 }],
            toast: `${prod.nombre} agregado al carrito`,
            isOpen: true,
          });
        }
        setTimeout(() => set({ toast: null }), 2800);
      },

      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      updateQty: (id, delta) => {
        const prod = getProducts().find((p) => p.id === id);
        if (!prod) return;
        const items = get().items;
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const newQty = item.qty + delta;
        if (newQty <= 0) {
          set({ items: items.filter((i) => i.id !== id) });
          return;
        }
        if (newQty > prod.stock) {
          set({ toast: `Solo hay ${prod.stock} unidades disponibles` });
          setTimeout(() => set({ toast: null }), 2800);
          return;
        }
        set({ items: items.map((i) => (i.id === id ? { ...i, qty: newQty } : i)) });
      },

      checkout: () => {
        const items = get().items;
        if (items.length === 0) return;

        let mensaje = "Hola Piel de Ángel\nQuisiera realizar el siguiente pedido:\n\n";
        let total = 0;

        items.forEach((item) => {
          const prod = getProducts().find((p) => p.id === item.id);
          if (!prod) return;
          const sub = prod.precio * item.qty;
          total += sub;
          mensaje += `• ${prod.nombre} x${item.qty} — ${formatPrecio(sub)}\n`;
        });

        mensaje += `\nTotal: ${formatPrecio(total)}\n\n¿Me confirman disponibilidad y forma de pago? Gracias`;
        window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`, "_blank");
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalAmount: () =>
        get().items.reduce((sum, item) => {
          const prod = getProducts().find((p) => p.id === item.id);
          return sum + (prod ? prod.precio * item.qty : 0);
        }, 0),
    }),
    {
      name: "pieldeangel_cart_v1",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
