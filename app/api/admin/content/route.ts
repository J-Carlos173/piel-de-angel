import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSetting, setSetting } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = ["content_hero", "content_about", "content_tienda"];

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const [hero, about, tienda] = await Promise.all([
    getSetting("content_hero").catch(() => null),
    getSetting("content_about").catch(() => null),
    getSetting("content_tienda").catch(() => null),
  ]);
  return NextResponse.json({ hero, about, tienda });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { key, value } = await req.json();
  if (!key || !ALLOWED_KEYS.includes(key) || typeof value !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  await setSetting(key, JSON.stringify(value));
  revalidatePath("/");
  revalidatePath("/tienda");
  return NextResponse.json({ ok: true });
}
