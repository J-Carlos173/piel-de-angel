import { NextRequest, NextResponse } from "next/server";

const BASE  = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
const EMAIL = process.env.MEDUSA_ADMIN_EMAIL;
const PASS  = process.env.MEDUSA_ADMIN_PASSWORD;

async function getToken(): Promise<string | null> {
  if (!BASE || !EMAIL || !PASS) return null;
  try {
    const res = await fetch(`${BASE}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASS }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return token ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "No configurado" }, { status: 500 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

    const medusaForm = new FormData();
    medusaForm.append("files", file);

    const res = await fetch(`${BASE}/admin/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: medusaForm,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[admin/upload] Medusa error:", err);
      return NextResponse.json({ error: "Error al subir imagen" }, { status: 400 });
    }

    const data = await res.json();
    const url = data.files?.[0]?.url ?? data.uploads?.[0]?.url ?? null;
    if (!url) return NextResponse.json({ error: "No se obtuvo URL de imagen" }, { status: 500 });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[admin/upload]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
