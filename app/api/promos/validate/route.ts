import { NextRequest, NextResponse } from "next/server";
import { validatePromo } from "@/lib/promos-db";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code?.trim()) return NextResponse.json({ valid: false, error: "Ingresa un código" });

    const promo = await validatePromo(code);
    if (!promo) return NextResponse.json({ valid: false, error: "Código inválido o agotado" });

    return NextResponse.json({ valid: true, discount: promo.discount, code: promo.code });
  } catch {
    return NextResponse.json({ valid: false, error: "Error al validar el código" }, { status: 500 });
  }
}
