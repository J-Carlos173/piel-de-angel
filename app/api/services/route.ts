import { NextResponse } from "next/server";
import { getPublishedServicios } from "@/lib/services-db";
import { getZonasDomicilio } from "@/lib/servicios-lp-content";

export async function GET() {
  try {
    const [servicios, zonas] = await Promise.all([getPublishedServicios(), getZonasDomicilio()]);
    return NextResponse.json({ servicios, zonas });
  } catch {
    return NextResponse.json({ servicios: [], zonas: [] });
  }
}
