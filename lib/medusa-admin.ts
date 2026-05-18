type StockItem = { id: string; qty: number };

export async function decrementProductStock(items: StockItem[]): Promise<void> {
  const BASE = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL;
  const KEY = process.env.MEDUSA_ADMIN_API_KEY;
  if (!BASE || !KEY) return;

  for (const item of items) {
    try {
      const res = await fetch(`${BASE}/admin/products/${item.id}?fields=+metadata`, {
        headers: { Authorization: `Bearer ${KEY}` },
      });
      if (!res.ok) continue;

      const { product } = await res.json();
      const currentStock = typeof product.metadata?.stock === "number" ? product.metadata.stock : 0;
      const newStock = Math.max(0, currentStock - item.qty);

      await fetch(`${BASE}/admin/products/${item.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata: { stock: newStock } }),
      });

      console.log(`[stock] ${item.id}: ${currentStock} → ${newStock}`);
    } catch (err) {
      console.error(`[stock] error descontando ${item.id}:`, err);
    }
  }
}
