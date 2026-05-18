import { NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/products-db";

export async function GET() {
  try {
    const products = await getPublishedProducts();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
