import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Servicios from "@/components/Servicios";
import Productos from "@/components/Productos";
import Galeria from "@/components/Galeria";
import Promociones from "@/components/Promociones";
import Instagram from "@/components/Instagram";
import Agenda from "@/components/Agenda";
import Testimonios from "@/components/Testimonios";
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
        <About />
        <Servicios />
        <Productos />
        <Galeria />
        <Promociones />
        <Instagram />
        <Agenda />
        <Testimonios />
      </RevealObserver>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
