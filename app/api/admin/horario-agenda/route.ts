import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { getHorarioAgenda, saveHorarioAgenda } from "@/lib/horario-agenda";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    return NextResponse.json({ horario: await getHorarioAgenda() });
  } catch (err) {
    console.error("[admin/horario-agenda GET]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { horario } = await req.json();
    const guardado = await saveHorarioAgenda(horario);
    return NextResponse.json({ horario: guardado });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
