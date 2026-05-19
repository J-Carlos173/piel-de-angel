import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, updateReviewStatus, deleteReview } from "@/lib/reviews-db";

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json({ reviews: [], error: String(err) });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, estado } = await req.json();
    if (!id || !["approved", "rejected"].includes(estado)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    await updateReviewStatus(id, estado);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await deleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
