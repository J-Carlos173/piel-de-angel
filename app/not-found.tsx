import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

const WA = `https://wa.me/56977031461?text=${encodeURIComponent("Hola, no encontré una página del sitio.")}`;

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="lp" style={{ minHeight: "75vh" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <span className="eyebrow">Error 404</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--negro-soft)", margin: "14px 0 16px" }}>
            No encontramos <em style={{ color: "var(--rosa-deep)", fontStyle: "italic" }}>esa página</em>
          </h1>
          <p className="lp-lead" style={{ margin: "0 auto 30px" }}>
            Puede que el enlace haya cambiado. Te dejamos algunos lugares para seguir.
          </p>
          <div className="lp-actions" style={{ justifyContent: "center" }}>
            <Link href="/tienda" className="btn-primary">
              <i className="fa-solid fa-bag-shopping" /> Ir a la tienda
            </Link>
            <a href="/#servicios" className="btn-secondary">
              Ver servicios <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
          <p className="lp-related">
            <Link href="/">Volver al inicio</Link> · <Link href="/consejos">consejos de piel</Link> ·{" "}
            <a href={WA} target="_blank" rel="noopener noreferrer">escribirnos por WhatsApp</a>
          </p>
        </div>
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
