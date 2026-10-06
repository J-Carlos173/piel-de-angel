export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Servicios from "@/components/Servicios";
import Productos from "@/components/Productos";
import Consejos from "@/components/Consejos";
import Promociones from "@/components/Promociones";
import Instagram from "@/components/Instagram";
import Agenda from "@/components/Agenda";
import Testimonios from "@/components/Testimonios";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import RevealObserver from "@/components/RevealObserver";
import { ciberdayActivo } from "@/lib/ciberday";

// Mientras dure la campaña, el título y la descripción de la home mencionan Ciberday para aparecer en esas búsquedas.
export async function generateMetadata(): Promise<Metadata> {
  if (!ciberdayActivo()) return {};
  return {
    title: { absolute: "Ciberday · Protector solar −30% y ojos y pestañas −20% · Piel de Ángel" },
    description:
      "Ciberday en Piel de Ángel: protectores solares con 30% de descuento y sérums para ojos y pestañas con 20% de descuento. Skincare coreano y premium con envío a todo Chile. Oferta hasta el 11 de octubre.",
    openGraph: {
      title: "Ciberday · Piel de Ángel",
      description: "Protector solar −30% y ojos y pestañas −20%. Oferta hasta el 11 de octubre.",
    },
  };
}

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <RevealObserver>
        <Productos />
        <Servicios />
        <Consejos />
        <Promociones />
        <Agenda />
        <About />
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
