export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Servicios from "@/components/Servicios";
import Productos from "@/components/Productos";
import Promociones from "@/components/Promociones";
import Instagram from "@/components/Instagram";
import Agenda from "@/components/Agenda";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import RevealObserver from "@/components/RevealObserver";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <RevealObserver>
        <Productos />
        <Servicios />
        <Promociones />
        <Agenda />
        <About />
        {/* Testimonios: oculto hasta tener reseñas reales de clientas. Volver a poner <Testimonios /> aquí cuando estén listas. */}
        <Instagram />
      </RevealObserver>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
