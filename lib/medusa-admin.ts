type StockItem = { id: string; qty: number };

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

export async function decrementProductStock(items: StockItem[]): Promise<void> {
  if (!BASE) return;
  const token = await getToken();
  if (!token) {
    console.error("[stock] No se pudo obtener token de Medusa");
    return;
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  for (const item of items) {
    try {
      const res = await fetch(`${BASE}/admin/products/${item.id}?fields=+metadata`, { headers });
      if (!res.ok) { console.error(`[stock] fetch error ${item.id}:`, res.status); continue; }

      const { product } = await res.json();
      const currentStock = typeof product.metadata?.stock === "number" ? product.metadata.stock : 0;
      const newStock = Math.max(0, currentStock - item.qty);

      await fetch(`${BASE}/admin/products/${item.id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ metadata: { ...product.metadata, stock: newStock } }),
      });

      console.log(`[stock] ${item.id}: ${currentStock} → ${newStock}`);
    } catch (err) {
      console.error(`[stock] error descontando ${item.id}:`, err);
    }
  }
}
