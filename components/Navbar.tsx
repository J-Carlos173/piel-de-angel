"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open, totalItems } = useCartStore();
  const count = totalItems();
  const { dark, toggle } = useThemeStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      <div className="container nav-wrapper">
        <a href="#inicio" className="logo">
          Piel de <span>Ángel</span>
        </a>

        <ul className={`nav-links${menuOpen ? " active" : ""}`} id="navLinks">
          {["inicio", "nosotros", "servicios", "productos", "galeria", "promociones", "agenda"].map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={closeMenu}
                style={{ textTransform: "capitalize" }}
              >
                {id === "productos" ? "Tienda" : id === "promociones" ? "Promos" : id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href="#agenda" className="nav-cta">
            Reservar Hora
          </a>
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={dark ? "Modo claro" : "Modo oscuro"}
          >
            <i className={`fa-solid ${dark ? "fa-sun" : "fa-moon"}`} />
          </button>
          <button
            className="cart-toggle"
            onClick={open}
            aria-label="Abrir carrito"
          >
            <i className="fa-solid fa-bag-shopping" />
            <span className={`cart-badge${count > 0 ? " active" : ""}`}>
              {count}
            </span>
          </button>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </div>
    </nav>
  );
}
