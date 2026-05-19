import { getDb } from "./db";

export type BlockedSlot = {
  id: string;
  date: string;
  time: string;
  reason: string;
  created_at?: string;
};

async function ensureTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS blocked_slots (
      id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      date       VARCHAR(10) NOT NULL,
      time       VARCHAR(5)  NOT NULL,
      reason     VARCHAR(200) DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (date, time)
    )
  `;
}

export async function getBlockedSlots(date: string): Promise<BlockedSlot[]> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`SELECT * FROM blocked_slots WHERE date = ${date} ORDER BY time ASC`;
  return rows as unknown as BlockedSlot[];
}

export async function getAllBlockedSlots(): Promise<BlockedSlot[]> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`SELECT * FROM blocked_slots WHERE date >= CURRENT_DATE::text ORDER BY date ASC, time ASC`;
  return rows as unknown as BlockedSlot[];
}

export async function blockSlot(date: string, time: string, reason = ""): Promise<BlockedSlot> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`
    INSERT INTO blocked_slots (date, time, reason)
    VALUES (${date}, ${time}, ${reason})
    ON CONFLICT (date, time) DO UPDATE SET reason = ${reason}
    RETURNING *
  `;
  return rows[0] as unknown as BlockedSlot;
}

export async function unblockSlot(date: string, time: string): Promise<boolean> {
  const sql = getDb();
  await sql`DELETE FROM blocked_slots WHERE date = ${date} AND time = ${time}`;
  return true;
}

export async function isSlotBlocked(date: string, time: string): Promise<boolean> {
  const sql = getDb();
  await ensureTable();
  const rows = await sql`SELECT 1 FROM blocked_slots WHERE date = ${date} AND time = ${time} LIMIT 1`;
  return rows.length > 0;
}
