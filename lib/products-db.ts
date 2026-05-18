import { getDb } from "./db";

export type Product = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  precio: number;
  stock: number;
  categoria: string;
  badge: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateProductData = Omit<Product, "id" | "created_at" | "updated_at">;
export type UpdateProductData = Partial<Omit<Product, "id" | "created_at" | "updated_at">>;

export async function ensureProductsTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title       VARCHAR(500) NOT NULL,
      description TEXT DEFAULT '',
      thumbnail   TEXT DEFAULT '',
      status      VARCHAR(20) NOT NULL DEFAULT 'published',
      precio      INTEGER DEFAULT 0,
      stock       INTEGER DEFAULT 0,
      categoria   VARCHAR(100) DEFAULT '',
      badge       VARCHAR(50) DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAllProducts(): Promise<Product[]> {
  const sql = getDb();
  await ensureProductsTable();
  const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  return rows as unknown as Product[];
}

export async function getPublishedProducts(): Promise<Product[]> {
  const sql = getDb();
  await ensureProductsTable();
  const rows = await sql`SELECT * FROM products WHERE status = 'published' ORDER BY created_at DESC`;
  return rows as unknown as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return (rows[0] as unknown as Product) ?? null;
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  const sql = getDb();
  await ensureProductsTable();
  const rows = await sql`
    INSERT INTO products (title, description, thumbnail, status, precio, stock, categoria, badge)
    VALUES (${data.title}, ${data.description ?? ""}, ${data.thumbnail ?? ""},
            ${data.status ?? "published"}, ${data.precio ?? 0}, ${data.stock ?? 0},
            ${data.categoria ?? ""}, ${data.badge ?? ""})
    RETURNING *
  `;
  return rows[0] as unknown as Product;
}

export async function updateProduct(id: string, data: UpdateProductData): Promise<Product | null> {
  const sql = getDb();
  const rows = await sql`
    UPDATE products SET
      title       = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      thumbnail   = COALESCE(${data.thumbnail ?? null}, thumbnail),
      status      = COALESCE(${data.status ?? null}, status),
      precio      = COALESCE(${data.precio ?? null}, precio),
      stock       = COALESCE(${data.stock ?? null}, stock),
      categoria   = COALESCE(${data.categoria ?? null}, categoria),
      badge       = COALESCE(${data.badge ?? null}, badge),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Product) ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const sql = getDb();
  await sql`DELETE FROM products WHERE id = ${id}`;
  return true;
}

export async function decrementProductStock(items: { id: string; qty: number }[]): Promise<void> {
  const sql = getDb();
  for (const { id, qty } of items) {
    try {
      await sql`
        UPDATE products
        SET stock = GREATEST(0, stock - ${qty}), updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (err) {
      console.error(`[decrementProductStock] error en ${id}:`, err);
    }
  }
}
