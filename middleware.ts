import { NextRequest, NextResponse } from "next/server";

// Mismo valor que lib/admin-token.ts (HMAC-SHA256 de la contraseña), calculado con
// Web Crypto para que funcione también en el runtime del middleware.
async function tokenEsperado(): Promise<string | null> {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pass), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("admin-session-v1"));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const cookie = req.cookies.get("admin_auth");
    const esperado = await tokenEsperado();

    if (!cookie || !esperado || cookie.value !== esperado) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
