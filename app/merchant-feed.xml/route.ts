import { getPublishedProducts } from "@/lib/products-db";
import { slugProducto } from "@/lib/slug";

// Feed para Google Merchant Center (RSS 2.0 con namespace g:). Se regenera cada hora desde los productos publicados.
export const revalidate = 3600;

const SITE = "https://www.pieldeangel.cl";

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Los títulos vienen como "Marca - Producto"; la marca es lo que está antes del guion.
const marcaDe = (titulo: string) => {
  const partes = titulo.split(" - ");
  return partes.length > 1 ? partes[0].trim() : "Piel de Ángel";
};

export async function GET() {
  let productos: Awaited<ReturnType<typeof getPublishedProducts>> = [];
  try {
    productos = await getPublishedProducts();
  } catch {
    productos = [];
  }

  const items = productos.map((p) => {
    const link = `${SITE}/producto/${slugProducto(p.title, p.id)}`;
    const imagen = p.thumbnail?.startsWith("http") ? p.thumbnail : `${SITE}${p.thumbnail ?? ""}`;
    const enOferta = p.precio_oferta != null && p.precio_oferta > 0 && p.precio_oferta < p.precio;
    return [
      "    <item>",
      `      <g:id>${xml(p.id)}</g:id>`,
      `      <title>${xml(p.title)}</title>`,
      `      <description>${xml((p.description || p.title).slice(0, 4900))}</description>`,
      `      <link>${xml(link)}</link>`,
      `      <g:image_link>${xml(imagen)}</g:image_link>`,
      `      <g:availability>${p.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>`,
      `      <g:price>${p.precio} CLP</g:price>`,
      enOferta ? `      <g:sale_price>${p.precio_oferta} CLP</g:sale_price>` : "",
      `      <g:brand>${xml(marcaDe(p.title))}</g:brand>`,
      `      <g:condition>new</g:condition>`,
      `      <g:identifier_exists>no</g:identifier_exists>`,
      p.categoria ? `      <g:product_type>${xml(p.categoria)}</g:product_type>` : "",
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const cuerpo = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "  <channel>",
    "    <title>Piel de Ángel</title>",
    `    <link>${SITE}</link>`,
    "    <description>Catálogo de productos de Piel de Ángel</description>",
    ...items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(cuerpo, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
