import { NextResponse } from "next/server";
import { getActiveConsejos } from "@/lib/consejos-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const consejos = await getActiveConsejos();
    return NextResponse.json({ consejos });
  } catch {
    return NextResponse.json({ consejos: [] });
  }
}
