import { getDb } from "./db";

export type Pedido = {
  id: number;
  texto: string;
  estado: "pendiente" | "en_proceso" | "hecho" | "error";
  respuesta: string | null;
  created_at: string;
  completed_at: string | null;
};

export async function ensurePedidosTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS ia_pedidos (
      id           SERIAL PRIMARY KEY,
      texto        TEXT NOT NULL,
      estado       VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      respuesta    TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;
}

export async function createPedido(texto: string): Promise<Pedido> {
  const sql = getDb();
  await ensurePedidosTable();
  const rows = await sql`
    INSERT INTO ia_pedidos (texto) VALUES (${texto})
    RETURNING *
  `;
  return rows[0] as unknown as Pedido;
}

export async function getAllPedidos(): Promise<Pedido[]> {
  const sql = getDb();
  await ensurePedidosTable();
  const rows = await sql`SELECT * FROM ia_pedidos ORDER BY created_at DESC LIMIT 100`;
  return rows as unknown as Pedido[];
}

export async function updatePedido(
  id: number,
  data: { estado?: Pedido["estado"]; respuesta?: string }
): Promise<Pedido | null> {
  const sql = getDb();
  const completedAt = data.estado === "hecho" || data.estado === "error" ? new Date().toISOString() : null;
  const rows = await sql`
    UPDATE ia_pedidos SET
      estado       = COALESCE(${data.estado ?? null}, estado),
      respuesta    = COALESCE(${data.respuesta ?? null}, respuesta),
      completed_at = COALESCE(${completedAt}, completed_at)
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Pedido) ?? null;
}
