import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const KEYS = ["notif_compras", "notif_citas", "notif_seguridad"] as const;

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const [compras, citas, seguridad] = await Promise.all(
    KEYS.map((k) => getSetting(k).catch(() => null))
  );
  return NextResponse.json({
    notif_compras:   compras   !== "false",
    notif_citas:     citas     !== "false",
    notif_seguridad: seguridad !== "false",
  });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json();
  await Promise.all(
    KEYS.filter((k) => k in body).map((k) =>
      setSetting(k, body[k] === false ? "false" : "true")
    )
  );
  return NextResponse.json({ ok: true });
}
