import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

    const folder = (formData.get("folder") as string | null) || "productos";
    const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[admin/upload]", err);
    return NextResponse.json({ error: "Error interno al subir imagen" }, { status: 500 });
  }
}
