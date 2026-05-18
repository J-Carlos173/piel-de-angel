import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Servicios from "@/components/Servicios";
import Productos from "@/components/Productos";
import Promociones from "@/components/Promociones";
import Instagram from "@/components/Instagram";
import Agenda from "@/components/Agenda";
import Testimonios from "@/components/Testimonios";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import RevealObserver from "@/components/RevealObserver";
import FallingLeaves from "@/components/FallingLeaves";

export default function Home() {
  return (
    <>
      <FallingLeaves />
      <Navbar />
      <Hero />
      <RevealObserver>
        <About />
        <Servicios />
        <Productos />
        <Promociones />
        <Agenda />
        <Testimonios />
        <Instagram />
      </RevealObserver>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
