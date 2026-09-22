import { NextResponse } from "next/server";
import { getActivePromosWeb } from "@/lib/promos-web-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const promos = await getActivePromosWeb();
    return NextResponse.json({ promos });
  } catch {
    return NextResponse.json({ promos: [] });
  }
}
