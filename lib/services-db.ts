import { getDb } from "./db";

export type Servicio = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: string;
  precio: number;
  duracion: number;
  categoria: string;
  orden: number;
  created_at?: string;
  updated_at?: string;
};

export type CreateServicioData = Omit<Servicio, "id" | "created_at" | "updated_at">;
export type UpdateServicioData = Partial<Omit<Servicio, "id" | "created_at" | "updated_at">>;

export async function ensureServiciosTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS servicios (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title       VARCHAR(500) NOT NULL,
      description TEXT DEFAULT '',
      thumbnail   TEXT DEFAULT '',
      status      VARCHAR(20) NOT NULL DEFAULT 'published',
      precio      INTEGER DEFAULT 0,
      duracion    INTEGER DEFAULT 0,
      categoria   VARCHAR(100) DEFAULT '',
      orden       INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAllServicios(): Promise<Servicio[]> {
  const sql = getDb();
  await ensureServiciosTable();
  const rows = await sql`SELECT * FROM servicios ORDER BY orden ASC, created_at ASC`;
  return rows as unknown as Servicio[];
}

export async function getPublishedServicios(): Promise<Servicio[]> {
  const sql = getDb();
  await ensureServiciosTable();
  const rows = await sql`SELECT * FROM servicios WHERE status = 'published' ORDER BY orden ASC, created_at ASC`;
  return rows as unknown as Servicio[];
}

export async function createServicio(data: CreateServicioData): Promise<Servicio> {
  const sql = getDb();
  await ensureServiciosTable();
  const rows = await sql`
    INSERT INTO servicios (title, description, thumbnail, status, precio, duracion, categoria, orden)
    VALUES (${data.title}, ${data.description ?? ""}, ${data.thumbnail ?? ""},
            ${data.status ?? "published"}, ${data.precio ?? 0}, ${data.duracion ?? 0},
            ${data.categoria ?? ""}, ${data.orden ?? 0})
    RETURNING *
  `;
  return rows[0] as unknown as Servicio;
}

export async function updateServicio(id: string, data: UpdateServicioData): Promise<Servicio | null> {
  const sql = getDb();
  const rows = await sql`
    UPDATE servicios SET
      title       = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      thumbnail   = COALESCE(${data.thumbnail ?? null}, thumbnail),
      status      = COALESCE(${data.status ?? null}, status),
      precio      = COALESCE(${data.precio ?? null}, precio),
      duracion    = COALESCE(${data.duracion ?? null}, duracion),
      categoria   = COALESCE(${data.categoria ?? null}, categoria),
      orden       = COALESCE(${data.orden ?? null}, orden),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Servicio) ?? null;
}

export async function deleteServicio(id: string): Promise<boolean> {
  const sql = getDb();
  await sql`DELETE FROM servicios WHERE id = ${id}`;
  return true;
}
