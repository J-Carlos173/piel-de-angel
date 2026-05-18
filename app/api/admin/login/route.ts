import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const envPass = process.env.ADMIN_PASSWORD || "pieldeangel2024";

  // Primero chequeamos si hay contraseña guardada en BD, si no, usamos env var
  const dbPass = await getSetting("admin_password").catch(() => null);
  const validPassword = dbPass ?? envPass;

  if (password !== validPassword) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 });
  }

  // El cookie siempre se basa en el env var (el middleware no cambia)
  const token = Buffer.from(envPass).toString("base64");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_auth");
  return res;
}
