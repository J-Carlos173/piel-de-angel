import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  eyebrow: "Nuestra Tienda",
  titleLine1: "Skincare",
  titleItalic: "Premium",
  subtitle:
    "Una selección curada de cosmética de alta gama para que cada día sea un ritual de cuidado. Compra fácil y rápido por WhatsApp.",
};

export async function GET() {
  try {
    const raw = await getSetting("content_tienda");
    const contenido = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    return NextResponse.json({ contenido });
  } catch {
    return NextResponse.json({ contenido: DEFAULTS });
  }
}
