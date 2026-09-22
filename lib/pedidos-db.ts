import { getDb } from "./db";

export type Pedido = {
  id: number;
  hilo_id: number | null;
  texto: string;
  imagenes: string[];
  estado: "pendiente" | "en_proceso" | "hecho" | "error";
  respuesta: string | null;
  /** Si la respuesta implicó subir un cambio a producción. Si es false, el panel muestra la respuesta al instante (sin la animación de "subiendo a producción"). */
  con_cambio: boolean;
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
  await sql`ALTER TABLE ia_pedidos ADD COLUMN IF NOT EXISTS imagenes JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE ia_pedidos ADD COLUMN IF NOT EXISTS hilo_id INTEGER`;
  await sql`ALTER TABLE ia_pedidos ADD COLUMN IF NOT EXISTS con_cambio BOOLEAN NOT NULL DEFAULT TRUE`;
}

export async function createPedido(texto: string, imagenes: string[] = [], hiloId?: number): Promise<Pedido> {
  const sql = getDb();
  await ensurePedidosTable();
  const rows = await sql`
    INSERT INTO ia_pedidos (texto, imagenes, hilo_id) VALUES (${texto}, ${JSON.stringify(imagenes)}::jsonb, ${hiloId ?? null})
    RETURNING *
  `;
  return rows[0] as unknown as Pedido;
}

export async function getAllPedidos(): Promise<Pedido[]> {
  const sql = getDb();
  await ensurePedidosTable();
  const rows = await sql`SELECT * FROM ia_pedidos ORDER BY created_at ASC LIMIT 300`;
  return rows as unknown as Pedido[];
}

export async function updatePedido(
  id: number,
  data: { estado?: Pedido["estado"]; respuesta?: string; con_cambio?: boolean }
): Promise<Pedido | null> {
  const sql = getDb();
  const completedAt = data.estado === "hecho" || data.estado === "error" ? new Date().toISOString() : null;
  const rows = await sql`
    UPDATE ia_pedidos SET
      estado       = COALESCE(${data.estado ?? null}, estado),
      respuesta    = COALESCE(${data.respuesta ?? null}, respuesta),
      con_cambio   = CASE WHEN ${data.con_cambio !== undefined} THEN ${data.con_cambio ?? true} ELSE con_cambio END,
      completed_at = COALESCE(${completedAt}, completed_at)
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Pedido) ?? null;
}

/** Borra el pedido; si es el primero de un hilo, borra todo el hilo con el. */
export async function deletePedido(id: number): Promise<boolean> {
  const sql = getDb();
  await sql`DELETE FROM ia_pedidos WHERE id = ${id} OR hilo_id = ${id}`;
  return true;
}
