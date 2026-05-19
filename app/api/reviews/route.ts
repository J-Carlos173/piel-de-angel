import { NextRequest, NextResponse } from "next/server";
import { getApprovedReviews, createReview } from "@/lib/reviews-db";

export async function GET() {
  try {
    const reviews = await getApprovedReviews();
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, texto, corazones } = await req.json();
    if (!nombre?.trim() || !texto?.trim()) {
      return NextResponse.json({ error: "Nombre y reseña son obligatorios" }, { status: 400 });
    }
    if (!corazones || corazones < 1 || corazones > 5) {
      return NextResponse.json({ error: "Valoración inválida" }, { status: 400 });
    }
    if (texto.trim().length < 10) {
      return NextResponse.json({ error: "La reseña es muy corta" }, { status: 400 });
    }
    const review = await createReview(nombre.trim(), texto.trim(), corazones);
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    console.error("[reviews POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
