import { getDb } from "./db";

export type Review = {
  id: string;
  nombre: string;
  texto: string;
  corazones: number;
  estado: "pending" | "approved" | "rejected";
  created_at?: string;
};

async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      nombre     VARCHAR(200) NOT NULL,
      texto      TEXT NOT NULL,
      corazones  INTEGER NOT NULL DEFAULT 5 CHECK (corazones BETWEEN 1 AND 5),
      estado     VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getApprovedReviews(): Promise<Review[]> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`SELECT * FROM reviews WHERE estado = 'approved' ORDER BY created_at DESC`;
  return rows as unknown as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
  return rows as unknown as Review[];
}

export async function createReview(nombre: string, texto: string, corazones: number): Promise<Review> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`
    INSERT INTO reviews (nombre, texto, corazones, estado)
    VALUES (${nombre}, ${texto}, ${corazones}, 'pending')
    RETURNING *
  `;
  return rows[0] as unknown as Review;
}

export async function updateReviewStatus(id: string, estado: "approved" | "rejected"): Promise<void> {
  const sql = getDb();
  await sql`UPDATE reviews SET estado = ${estado} WHERE id = ${id}`;
}

export async function deleteReview(id: string): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM reviews WHERE id = ${id}`;
}
