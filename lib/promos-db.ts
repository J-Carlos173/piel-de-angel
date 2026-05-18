import { getDb } from "./db";

export type PromoCode = {
  id: number;
  code: string;
  discount: number;
  max_uses: number;
  used_count: number;
  active: boolean;
  created_at: string;
};

export async function ensurePromosTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id         SERIAL PRIMARY KEY,
      code       VARCHAR(50) UNIQUE NOT NULL,
      discount   INTEGER NOT NULL,
      max_uses   INTEGER NOT NULL DEFAULT 1,
      used_count INTEGER NOT NULL DEFAULT 0,
      active     BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAllPromos(): Promise<PromoCode[]> {
  const sql = getDb();
  await ensurePromosTable();
  const rows = await sql`SELECT * FROM promo_codes ORDER BY created_at DESC`;
  return rows as unknown as PromoCode[];
}

export async function createPromo(data: { code: string; discount: number; max_uses: number }): Promise<PromoCode> {
  const sql = getDb();
  await ensurePromosTable();
  const rows = await sql`
    INSERT INTO promo_codes (code, discount, max_uses)
    VALUES (${data.code.toUpperCase().trim()}, ${data.discount}, ${data.max_uses})
    RETURNING *
  `;
  return rows[0] as unknown as PromoCode;
}

export async function validatePromo(code: string): Promise<PromoCode | null> {
  const sql = getDb();
  await ensurePromosTable();
  const rows = await sql`
    SELECT * FROM promo_codes
    WHERE code = ${code.toUpperCase().trim()} AND active = true AND used_count < max_uses
    LIMIT 1
  `;
  return (rows[0] as unknown as PromoCode) ?? null;
}

export async function incrementPromoUsage(code: string): Promise<void> {
  if (!code) return;
  const sql = getDb();
  await sql`
    UPDATE promo_codes
    SET used_count = used_count + 1,
        active = CASE WHEN used_count + 1 >= max_uses THEN false ELSE active END
    WHERE code = ${code.toUpperCase().trim()}
  `;
}

export async function togglePromoActive(id: number, active: boolean): Promise<void> {
  const sql = getDb();
  await sql`UPDATE promo_codes SET active = ${active} WHERE id = ${id}`;
}

export async function deletePromo(id: number): Promise<void> {
  const sql = getDb();
  await sql`DELETE FROM promo_codes WHERE id = ${id}`;
}
