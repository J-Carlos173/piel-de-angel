import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL no está configurada");
  return neon(url);
}

export type OrderItem = { nombre: string; precio: number; qty: number };

export type OrderCustomer = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  depto: string;
  ciudad: string;
  region: string;
};

export async function ensureOrdersTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id              SERIAL PRIMARY KEY,
      buy_order       VARCHAR(60)  UNIQUE NOT NULL,
      status          VARCHAR(20)  NOT NULL DEFAULT 'pending',
      customer_nombre VARCHAR(200),
      customer_email  VARCHAR(200),
      customer_tel    VARCHAR(50),
      customer_dir    TEXT,
      customer_depto  VARCHAR(100),
      customer_ciudad VARCHAR(100),
      customer_region VARCHAR(100),
      zona            VARCHAR(50),
      items           JSONB,
      subtotal        INTEGER,
      envio           INTEGER,
      total           INTEGER,
      amount          INTEGER,
      auth_code       VARCHAR(50),
      card_last4      VARCHAR(10),
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      confirmed_at    TIMESTAMPTZ
    )
  `;
}

export async function saveOrderPending(data: {
  buyOrder: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  envio: number;
  total: number;
  zona: string;
}) {
  const sql = getDb();
  await ensureOrdersTable();
  const { buyOrder, customer, items, subtotal, envio, total, zona } = data;
  await sql`
    INSERT INTO orders
      (buy_order, status, customer_nombre, customer_email, customer_tel,
       customer_dir, customer_depto, customer_ciudad, customer_region,
       zona, items, subtotal, envio, total)
    VALUES
      (${buyOrder}, 'pending', ${customer.nombre}, ${customer.email}, ${customer.telefono},
       ${customer.direccion}, ${customer.depto}, ${customer.ciudad}, ${customer.region},
       ${zona}, ${JSON.stringify(items)}, ${subtotal}, ${envio}, ${total})
    ON CONFLICT (buy_order) DO NOTHING
  `;
}

export async function confirmOrder(data: {
  buyOrder: string;
  amount: number;
  authCode: string;
  cardLast4: string;
}) {
  const sql = getDb();
  const { buyOrder, amount, authCode, cardLast4 } = data;
  await sql`
    UPDATE orders
    SET status = 'confirmed',
        amount = ${amount},
        auth_code = ${authCode},
        card_last4 = ${cardLast4},
        confirmed_at = NOW()
    WHERE buy_order = ${buyOrder}
  `;
}

export async function getOrder(buyOrder: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM orders WHERE buy_order = ${buyOrder} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getAllOrders() {
  const sql = getDb();
  return sql`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT 200
  `;
}

export async function getConfirmedOrders() {
  const sql = getDb();
  return sql`
    SELECT * FROM orders
    WHERE status = 'confirmed'
    ORDER BY confirmed_at DESC
    LIMIT 500
  `;
}

async function ensureSettingsTable(sql: ReturnType<typeof getDb>) {
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key   VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;
}

export async function getSetting(key: string): Promise<string | null> {
  const sql = getDb();
  await ensureSettingsTable(sql);
  const rows = await sql`SELECT value FROM settings WHERE key = ${key} LIMIT 1`;
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const sql = getDb();
  await ensureSettingsTable(sql);
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `;
}
