import { NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const KEY  = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export async function GET() {
  if (!BASE || !KEY) {
    return NextResponse.json({ products: [] });
  }
  try {
    const res = await fetch(
      `${BASE}/store/products?fields=*variants.prices,+metadata&limit=100`,
      {
        headers: { "x-publishable-api-key": KEY },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return NextResponse.json({ products: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ products: [] });
  }
}
