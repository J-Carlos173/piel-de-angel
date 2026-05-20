import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/db";
import { sendSecurityAlert } from "@/lib/email";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000; // 15 min

const attempts = new Map<string, { count: number; resetAt: number }>();

function getIP(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip  = getIP(req);
  const now = Date.now();

  const entry = attempts.get(ip);
  if (entry) {
    if (now < entry.resetAt && entry.count >= MAX_ATTEMPTS) {
      const mins = Math.ceil((entry.resetAt - now) / 60000);
      return NextResponse.json(
        { ok: false, error: `Demasiados intentos. Espera ${mins} min.` },
        { status: 429 }
      );
    }
    if (now >= entry.resetAt) attempts.delete(ip);
  }

  const { password } = await req.json();
  const envPass = process.env.ADMIN_PASSWORD || "pieldeangel2024";
  const dbPass  = await getSetting("admin_password").catch(() => null);
  const valid   = dbPass ?? envPass;

  if (password !== valid) {
    const cur      = attempts.get(ip) ?? { count: 0, resetAt: now + LOCKOUT_MS };
    const newCount = cur.count + 1;
    attempts.set(ip, { count: newCount, resetAt: cur.resetAt });
    const left = MAX_ATTEMPTS - newCount;
    if (newCount === MAX_ATTEMPTS) {
      getSetting("notif_seguridad").then((v) => {
        if (v !== "false") sendSecurityAlert(ip).catch(() => {});
      }).catch(() => sendSecurityAlert(ip).catch(() => {}));
    }
    const msg = left > 0 ? `Contraseña incorrecta (${left} intentos restantes)` : `Bloqueado 15 min.`;
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }

  attempts.delete(ip);
  const token = Buffer.from(envPass).toString("base64");
  const res   = NextResponse.json({ ok: true });
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
