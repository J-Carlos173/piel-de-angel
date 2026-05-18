import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const cookie = req.cookies.get("admin_auth");
    const adminPass = process.env.ADMIN_PASSWORD || "pieldeangel2024";
    const expected = Buffer.from(adminPass).toString("base64");

    if (!cookie || cookie.value !== expected) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
