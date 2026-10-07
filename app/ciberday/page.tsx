import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import { getActivePromosWeb } from "@/lib/promos-web-db";
import { getPublishedProducts } from "@/lib/products-db";
import { ciberdayActivo, CIBERDAY_FIN } from "@/lib/ciberday";
import { formatPrecio } from "@/data/productos";
import { slugProducto } from "@/lib/slug";

export const revalidate = 300;

const SITE = "https://www.pieldeangel.cl";
const URL = `${SITE}/ciberday`;
const TITULO = "Ciberday · Protector solar −30% y ojos y pestañas −20% · Piel de Ángel";
const DESCRIPCION =
  "Ofertas Ciberday en Piel de Ángel: protectores solares con 30% de descuento y sérums y contornos para ojos y pestañas con 20% de descuento. Skincare coreano con envío a todo Chile. Hasta el 11 de octubre.";

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRIPCION,
  alternates: { canonical: URL },
  openGraph: { type: "website", locale: "es_CL", url: URL, siteName: "Piel de Ángel", title: TITULO, description: DESCRIPCION },
};

const fechaFin = CIBERDAY_FIN.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Santiago" });

export default async function CiberdayPage() {
  let items: { titulo: string; id: string; precio: number; oferta: number | null; thumbnail: string; stock: number }[] = [];
  try {
    const [promos, productos] = await Promise.all([getActivePromosWeb(), getPublishedProducts()]);
    items = promos
      .filter((p) => p.producto_id)
      .flatMap((p) => {
        const prod = productos.find((x) => x.id === p.producto_id);
        return prod
          ? [{ titulo: prod.title, id: prod.id, precio: prod.precio, oferta: prod.precio_oferta ?? null, thumbnail: prod.thumbnail ?? "", stock: prod.stock }]
          : [];
      });
  } catch {
    items = [];
  }
  const vigente = ciberdayActivo();

  return (
    <>
      <Navbar />
      <main className="consejos-section" style={{ minHeight: "70vh" }}>
        <div className="container" style={{ maxWidth: 960, margin: "0 auto", padding: "60px 24px" }}>
          <span className="section-tag">✦ Ciberday ✦</span>
          <h1 className="section-title">Ofertas Ciberday en skincare</h1>
          <p className="section-subtitle" style={{ maxWidth: 640 }}>
            {vigente
              ? `Protectores solares con 30% de descuento y sérums y contornos para ojos y pestañas con 20% de descuento. Oferta válida hasta el ${fechaFin}.`
              : "La campaña Ciberday terminó. Revisa la tienda para ver los productos disponibles."}
          </p>

          {vigente && items.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24, marginTop: 40 }}>
              {items.map((it) => {
                const enOferta = it.oferta != null && it.oferta > 0 && it.oferta < it.precio;
                return (
                  <article key={it.id} className="promo-card promo-card-ciberday" style={{ padding: 22 }}>
                    <span className="producto-badge-oferta" style={{ alignSelf: "flex-start" }}>CIBERDAY</span>
                    {it.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.thumbnail} alt={it.titulo} loading="lazy" decoding="async" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", borderRadius: 12, background: "#fff" }} />
                    )}
                    <h2 style={{ fontSize: 16, margin: "10px 0 6px" }}>{it.titulo}</h2>
                    <div className="pp-precio" style={{ marginBottom: 12 }}>
                      {enOferta ? (
                        <>
                          <span className="pp-precio-original">{formatPrecio(it.precio)}</span>{" "}
                          <span className="pp-precio-oferta">{formatPrecio(it.oferta!)}</span>
                        </>
                      ) : (
                        <span className="pp-precio-normal">{formatPrecio(it.precio)}</span>
                      )}
                    </div>
                    <a href={`/producto/${slugProducto(it.titulo, it.id)}`} className="promo-cta">
                      {it.stock > 0 ? "Ver producto" : "Ver producto (agotado)"}
                    </a>
                  </article>
                );
              })}
            </div>
          )}

          <p style={{ marginTop: 48, color: "var(--texto)", lineHeight: 1.7 }}>
            Los precios de oferta aplican solo durante Ciberday. Para ver todo el catálogo, visita la <a href="/#productos">tienda</a>.
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
