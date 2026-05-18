import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { currentPassword, newPassword } = await req.json();

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ ok: false, error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const envPass = process.env.ADMIN_PASSWORD || "pieldeangel2024";
  const dbPass = await getSetting("admin_password").catch(() => null);
  const validPassword = dbPass ?? envPass;

  if (currentPassword !== validPassword) {
    return NextResponse.json({ ok: false, error: "Contraseña actual incorrecta" }, { status: 401 });
  }

  await setSetting("admin_password", newPassword);
  return NextResponse.json({ ok: true });
}
