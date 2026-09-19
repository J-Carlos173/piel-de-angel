import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Productos from "@/components/Productos";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { getPublishedProducts } from "@/lib/products-db";
import { COSTO_ENVIO, GRATIS_SANTIAGO } from "@/lib/pricing";
import { formatPrecio } from "@/data/productos";

export const revalidate = 600;

const SITE = "https://www.pieldeangel.cl";
const URL = `${SITE}/tienda`;
const TITLE = "Tienda de skincare coreano online en Chile";
const DESCRIPTION = `Compra skincare coreano online en Chile: sérums, cremas, limpiadores, mascarillas y protector solar. Envío a todo el país y despacho gratis en Santiago sobre ${formatPrecio(GRATIS_SANTIAGO)}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: URL,
    siteName: "Piel de Ángel",
    title: `${TITLE} · Piel de Ángel`,
    description: DESCRIPTION,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Tienda Piel de Ángel" }],
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Hacen envíos a todo Chile?",
    a: `Sí. En Santiago el envío cuesta ${formatPrecio(COSTO_ENVIO)} y es gratis en compras desde ${formatPrecio(GRATIS_SANTIAGO)}. En regiones el envío no se cobra en la compra: se paga directamente al transportista al recibir el pedido.`,
  },
  {
    q: "¿Cómo puedo pagar?",
    a: "Con tarjeta de crédito o débito a través de WebPay. Es un pago seguro y nosotros no guardamos los datos de tu tarjeta.",
  },
  {
    q: "¿Puedo devolver un producto?",
    a: "Tienes derecho a retracto dentro de los 10 días hábiles siguientes a la recepción, siempre que el producto no haya sido abierto ni usado. Los detalles están en los Términos y Condiciones.",
  },
  {
    q: "¿Cómo sé si un producto es para mi tipo de piel?",
    a: "Escríbenos por WhatsApp y te ayudamos a elegir según tu piel y tu rutina. También puedes revisar los consejos de piel del sitio.",
  },
];

function lista(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export default async function TiendaPage() {
  let categorias: string[] = [];
  let marcas: string[] = [];
  try {
    const productos = await getPublishedProducts();
    categorias = Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean)));
    // Se agrupa sin distinguir mayúsculas ("Beauty Of Joseon" y "Beauty of Joseon" son la misma marca).
    const conteo = new Map<string, { nombre: string; n: number }>();
    for (const p of productos) {
      const marca = p.title.includes(" - ") ? p.title.split(" - ")[0].trim() : "";
      if (!marca) continue;
      const clave = marca.toLowerCase();
      const previo = conteo.get(clave);
      conteo.set(clave, { nombre: previo?.nombre ?? marca, n: (previo?.n ?? 0) + 1 });
    }
    marcas = Array.from(conteo.values()).sort((a, b) => b.n - a.n).slice(0, 8).map((m) => m.nombre);
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${URL}#pagina`,
        name: TITLE,
        url: URL,
        description: DESCRIPTION,
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": `${SITE}/#store` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
          { "@type": "ListItem", position: 2, name: "Tienda", item: URL },
        ],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <section className="lp" style={{ paddingBottom: 10 }}>
          <div className="container">
            <span className="eyebrow">Tienda online</span>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", lineHeight: 1.1, color: "var(--negro-soft)", margin: "14px 0 20px" }}>
              Tienda de skincare coreano
              <em style={{ display: "block", color: "var(--rosa-deep)", fontStyle: "italic" }}>online en Chile</em>
            </h1>
            <p className="lp-lead" style={{ maxWidth: 640 }}>
              Sérums, cremas, limpiadores, mascarillas y protección solar
              {marcas.length > 0 && <> de marcas como {lista(marcas)}</>}. Despachamos a todo Chile.
            </p>
            {categorias.length > 0 && (
              <div className="lp-chips">
                {categorias.map((c) => (
                  <span key={c} className="lp-chip">{c}</span>
                ))}
              </div>
            )}
          </div>
        </section>

        <Productos />

        <section className="lp" style={{ paddingTop: 30 }}>
          <div className="container">
            <div className="lp-body" style={{ marginTop: 0 }}>
              <h2 style={{ marginTop: 0 }}>Envíos y pagos</h2>
              <ul>
                <li>Santiago: {formatPrecio(COSTO_ENVIO)}, gratis desde {formatPrecio(GRATIS_SANTIAGO)} de compra.</li>
                <li>Regiones: el envío se paga al transportista al recibir el pedido.</li>
                <li>Pago con tarjeta de crédito o débito por WebPay.</li>
              </ul>

              <h2>Preguntas frecuentes</h2>
              <div className="lp-faq">
                {FAQ.map(({ q, a }) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>

              <p className="lp-related">
                Mira también: <a href="/#servicios">servicios a domicilio</a> · <a href="/consejos">consejos de piel</a> ·{" "}
                <a href="/terminos">términos y condiciones</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
