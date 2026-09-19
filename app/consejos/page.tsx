import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Consejos from "@/components/Consejos";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import RevealObserver from "@/components/RevealObserver";

export const metadata: Metadata = {
  title: "Consejos de piel",
  description:
    "Consejos de cuidado de la piel: protector solar, limpieza, exfoliación, retinol e hidratación, basados en recomendaciones de dermatología.",
  alternates: { canonical: "https://www.pieldeangel.cl/consejos" },
};

export default function ConsejosPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "70vh" }}>
        <RevealObserver>
          <Consejos />
        </RevealObserver>
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
