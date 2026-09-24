import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const fallos = new Map<string, { n: number; hasta: number }>();

// Verifica el PIN del Asistente IA. Solo responde si ya hay sesión de administrador.
export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ahora = Date.now();
  const f = fallos.get(ip);
  if (f && ahora < f.hasta && f.n >= 5) return NextResponse.json({ ok: false, bloqueado: true }, { status: 429 });

  const { pin } = await req.json().catch(() => ({ pin: "" }));
  const correcto = process.env.PEDIDOS_PIN || "159632";
  const a = Buffer.from(String(pin ?? ""));
  const b = Buffer.from(correcto);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (ok) { fallos.delete(ip); return NextResponse.json({ ok: true }); }
  fallos.set(ip, { n: (f && ahora < f.hasta ? f.n : 0) + 1, hasta: ahora + 10 * 60 * 1000 });
  return NextResponse.json({ ok: false }, { status: 401 });
}
