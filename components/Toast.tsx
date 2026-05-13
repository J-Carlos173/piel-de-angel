"use client";

import { useCartStore } from "@/store/cartStore";

export default function Toast() {
  const toast = useCartStore((s) => s.toast);

  return (
    <div className={`toast${toast ? " show" : ""}`}>
      <i className="fa-solid fa-check-circle" />
      <span>{toast}</span>
    </div>
  );
}
