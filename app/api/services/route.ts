import { NextResponse } from "next/server";
import { getPublishedServicios } from "@/lib/services-db";

export async function GET() {
  try {
    const servicios = await getPublishedServicios();
    return NextResponse.json({ servicios });
  } catch {
    return NextResponse.json({ servicios: [] });
  }
}
