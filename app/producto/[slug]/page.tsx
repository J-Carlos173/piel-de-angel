import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { getPublishedProducts, type Product } from "@/lib/products-db";
import { formatPrecio, precioFinal, WHATSAPP_NUMERO } from "@/data/productos";
import { idPrefijoDeSlug, slugProducto } from "@/lib/slug";

// Siempre al día: precio, oferta y stock salen de la base cada vez.
export const dynamic = "force-dynamic";

const SITE = "https://www.pieldeangel.cl";

async function buscar(slug: string): Promise<{ producto: Product | null; todos: Product[] }> {
  try {
    const todos = await getPublishedProducts();
    const prefijo = idPrefijoDeSlug(slug);
    return { producto: todos.find((p) => p.id.slice(0, 8).toLowerCase() === prefijo) ?? null, todos };
  } catch {
    return { producto: null, todos: [] };
  }
}

function marcaDe(titulo: string): string | undefined {
  return titulo.includes(" - ") ? titulo.split(" - ")[0].trim() : undefined;
}

function recorte(texto: string, max: number): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  return limpio.length <= max ? limpio : `${limpio.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { producto: p } = await buscar(slug);
  if (!p) return { robots: { index: false, follow: true } };

  const url = `${SITE}/producto/${slugProducto(p.title, p.id)}`;
  const precio = formatPrecio(precioFinal(p));
  const descripcion = recorte(
    `Compra ${p.title} en Chile por ${precio}. ${p.description || "Skincare coreano con envío a todo el país."}`,
    158
  );
  return {
    title: `${p.title} — comprar en Chile`,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url,
      siteName: "Piel de Ángel",
      title: `${p.title} · Piel de Ángel`,
      description: descripcion,
      images: p.thumbnail ? [{ url: p.thumbnail, alt: p.title }] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { producto: p, todos } = await buscar(slug);

  // Producto borrado u oculto: se manda a la tienda en vez de mostrar un error.
  if (!p) redirect("/tienda");

  // Si cambió el nombre, la dirección vieja lleva a la nueva.
  const slugActual = slugProducto(p.title, p.id);
  if (slug.toLowerCase() !== slugActual) permanentRedirect(`/producto/${slugActual}`);

  const url = `${SITE}/producto/${slugActual}`;
  const final = precioFinal(p);
  const enOferta = final < p.precio;
  const ahorro = enOferta ? Math.round((1 - final / p.precio) * 100) : 0;
  const agotado = p.stock <= 0;
  const stockTexto = agotado ? "Agotado por ahora" : p.stock <= 3 ? "¡Pocas unidades!" : "En stock";
  const marca = marcaDe(p.title);
  const wa = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(`Hola, me interesa "${p.title}". ¿Me puedes dar más información?`)}`;
  const relacionados = todos.filter((x) => x.id !== p.id && x.categoria === p.categoria).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#producto`,
        name: p.title,
        description: p.description || undefined,
        image: p.thumbnail || undefined,
        sku: p.id,
        category: p.categoria || undefined,
        brand: marca ? { "@type": "Brand", name: marca } : undefined,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "CLP",
          price: final,
          itemCondition: "https://schema.org/NewCondition",
          availability: agotado ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          seller: { "@id": `${SITE}/#business` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
          { "@type": "ListItem", position: 2, name: "Tienda", item: `${SITE}/tienda` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="lp">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container">
          <div className={`lp-hero${p.thumbnail ? "" : " sin-foto"}`}>
            <div>
              {p.categoria && <span className="eyebrow">{p.categoria}</span>}
              <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>{p.title}</h1>

              {enOferta && <span className="producto-badge-oferta">Ahorra {ahorro}%</span>}
              <div className="pp-precio">
                {enOferta ? (
                  <>
                    <span className="pp-precio-original">{formatPrecio(p.precio)}</span>
                    <span className="pp-precio-oferta">{formatPrecio(final)}</span>
                  </>
                ) : (
                  <span className="pp-precio-normal">{formatPrecio(p.precio)}</span>
                )}
              </div>
              <p className="pp-stock">{stockTexto}</p>

              {p.description && <p className="lp-lead">{p.description}</p>}

              <div className="lp-actions">
                <Link href="/tienda" className="btn-primary">
                  <i className="fa-solid fa-bag-shopping" /> {agotado ? "Ver la tienda" : "Comprar en la tienda"}
                </Link>
                <a href={wa} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" /> Consultar por WhatsApp
                </a>
              </div>
            </div>
            {p.thumbnail && (
              <div className="lp-photo pp-foto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail} alt={p.title} />
              </div>
            )}
          </div>

          {relacionados.length > 0 && (
            <div className="lp-body">
              <h2>Más de {p.categoria || "la tienda"}</h2>
              <div className="lp-chips">
                {relacionados.map((r) => (
                  <Link key={r.id} href={`/producto/${slugProducto(r.title, r.id)}`} className="lp-chip lp-chip-link">
                    {r.title}
                  </Link>
                ))}
              </div>
              <p className="lp-related">
                <Link href="/tienda">Ver toda la tienda</Link> · <Link href="/consejos">consejos de piel</Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsappFloat />
      <CartDrawer />
      <Toast />
    </>
  );
}
