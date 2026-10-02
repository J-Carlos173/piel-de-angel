import { NextResponse } from "next/server";
import { getHorarioAgenda, describirHorario } from "@/lib/horario-agenda";

export const dynamic = "force-dynamic";

// Público: solo el texto legible del horario (no bloqueos ni datos administrativos),
// para que el sitio nunca muestre un horario desactualizado.
export async function GET() {
  try {
    const horario = await getHorarioAgenda();
    return NextResponse.json({ texto: describirHorario(horario) });
  } catch {
    return NextResponse.json({ texto: "" });
  }
}
