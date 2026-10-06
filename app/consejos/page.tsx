import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { getActiveConsejos } from "@/lib/consejos-db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Consejos de piel",
  description:
    "Consejos de cuidado de la piel: protector solar, limpieza, exfoliación, retinol e hidratación, basados en recomendaciones de dermatología.",
  alternates: { canonical: "https://www.pieldeangel.cl/consejos" },
};

// La lista va renderizada en el servidor para que Google lea todo el texto de cada consejo.
export default async function ConsejosPage() {
  let consejos: Awaited<ReturnType<typeof getActiveConsejos>> = [];
  try {
    consejos = await getActiveConsejos();
  } catch {
    consejos = [];
  }

  return (
    <>
      <Navbar />
      <main className="consejos-section" style={{ minHeight: "70vh" }}>
        <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
          <h1 className="section-title">Consejos de piel</h1>
          <p className="section-subtitle">Recomendaciones de cuidado de la piel, pensadas para el clima y el estilo de vida de Santiago.</p>
          {consejos.map((c) => (
            <article key={c.id} id={`consejo-${c.id}`} className="consejo-seo" style={{ margin: "36px 0", paddingBottom: 28, borderBottom: "1px solid var(--gris-suave)" }}>
              {c.categoria && <span className="section-tag">{c.categoria}</span>}
              <h2 style={{ fontSize: 22, margin: "10px 0" }}>{c.titulo}</h2>
              <p style={{ lineHeight: 1.7, color: "var(--texto)" }}>{c.texto}</p>
              {c.fuente && <p style={{ fontSize: 13, color: "var(--texto-soft)", marginTop: 10 }}>Fuente: {c.fuente}</p>}
            </article>
          ))}
        </div>
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
