import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getAllProducts, updateProduct } from "@/lib/products-db";

export async function POST() {
  try {
    const products = await getAllProducts();
    const results: { id: string; title: string; status: string; newUrl?: string }[] = [];

    for (const p of products) {
      if (!p.thumbnail) {
        results.push({ id: p.id, title: p.title, status: "sin_imagen" });
        continue;
      }

      // Solo migrar imágenes que no estén ya en Vercel Blob
      if (p.thumbnail.includes("vercel-storage.com") || p.thumbnail.includes("blob.vercel")) {
        results.push({ id: p.id, title: p.title, status: "ya_en_blob" });
        continue;
      }

      try {
        const imgRes = await fetch(p.thumbnail);
        if (!imgRes.ok) {
          results.push({ id: p.id, title: p.title, status: `error_fetch_${imgRes.status}` });
          continue;
        }

        const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
        const filename = `productos/${p.id}.${ext}`;

        const blob = await put(filename, imgRes.body!, {
          access: "public",
          contentType,
        });

        await updateProduct(p.id, { thumbnail: blob.url });
        results.push({ id: p.id, title: p.title, status: "migrado", newUrl: blob.url });
      } catch (err) {
        results.push({ id: p.id, title: p.title, status: `error: ${String(err)}` });
      }
    }

    const migrados = results.filter((r) => r.status === "migrado").length;
    return NextResponse.json({ migrados, total: products.length, results });
  } catch (err) {
    console.error("[migrate-images]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
