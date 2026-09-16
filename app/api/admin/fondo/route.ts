import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { isAdminAuthorized as isAuthorized } from "@/lib/admin-auth";

const VALIDOS = ["malla", "grano", "aurora", "lujo", "botanico", "terracota", "ondas", "bokeh", "minimal"];

export async function GET() {
  try {
    const fondo = await getSetting("site_background");
    return NextResponse.json({ fondo: fondo ?? null });
  } catch {
    return NextResponse.json({ fondo: null });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { fondo } = await req.json();
    if (fondo !== null && !VALIDOS.includes(fondo)) {
      return NextResponse.json({ error: "Fondo inválido" }, { status: 400 });
    }
    await setSetting("site_background", fondo ?? "");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
