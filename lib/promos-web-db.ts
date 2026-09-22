import { getDb, getSetting, setSetting } from "./db";

export type PromoWeb = {
  id: number;
  tag: string;
  title: string;
  description: string;
  prizes: string[];
  cta: string;
  href: string;
  finalizado: boolean;
  activo: boolean;
  orden: number;
  created_at: string;
};

type CreatePromoWebData = Omit<PromoWeb, "id" | "created_at">;
type UpdatePromoWebData = Partial<CreatePromoWebData>;

export async function ensurePromosWebTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS promos_web (
      id          SERIAL PRIMARY KEY,
      tag         VARCHAR(200) NOT NULL DEFAULT '',
      title       VARCHAR(300) NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      prizes      JSONB NOT NULL DEFAULT '[]'::jsonb,
      cta         VARCHAR(100) NOT NULL DEFAULT 'Ver publicación',
      href        TEXT NOT NULL DEFAULT '',
      finalizado  BOOLEAN NOT NULL DEFAULT FALSE,
      activo      BOOLEAN NOT NULL DEFAULT TRUE,
      orden       INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Se carga una sola vez el concurso anterior al lanzamiento, oculto (Tere pidió esconderlo).
  if ((await getSetting("promos_web_semilla")) === null) {
    await sql`
      INSERT INTO promos_web (tag, title, description, prizes, cta, href, finalizado, activo, orden)
      VALUES (
        'Concurso · Día de la Madre',
        '¡Regala belleza este Día de la Madre!',
        'Sorteamos una Limpieza Facial Profunda y un Lifting de Pestañas. Para participar: síguenos, comenta con 🤍 y etiqueta a esa mamá especial. Mientras más comentarios, más chances.',
        '["Limpieza facial profunda", "Lifting de pestañas"]'::jsonb,
        'Ver publicación',
        'https://www.instagram.com/p/DX-fsnigsff',
        TRUE, FALSE, 0
      )
    `;
    await setSetting("promos_web_semilla", "1");
  }
}

export async function getAllPromosWeb(): Promise<PromoWeb[]> {
  const sql = getDb();
  await ensurePromosWebTable();
  const rows = await sql`SELECT * FROM promos_web ORDER BY orden ASC, id DESC`;
  return rows as unknown as PromoWeb[];
}

export async function getActivePromosWeb(): Promise<PromoWeb[]> {
  const sql = getDb();
  await ensurePromosWebTable();
  const rows = await sql`SELECT * FROM promos_web WHERE activo = TRUE ORDER BY orden ASC, id DESC`;
  return rows as unknown as PromoWeb[];
}

export async function createPromoWeb(d: CreatePromoWebData): Promise<PromoWeb> {
  const sql = getDb();
  await ensurePromosWebTable();
  const rows = await sql`
    INSERT INTO promos_web (tag, title, description, prizes, cta, href, finalizado, activo, orden)
    VALUES (
      ${d.tag}, ${d.title}, ${d.description}, ${JSON.stringify(d.prizes ?? [])}::jsonb,
      ${d.cta || "Ver publicación"}, ${d.href || ""}, ${d.finalizado ?? false}, ${d.activo ?? true}, ${d.orden ?? 0}
    )
    RETURNING *
  `;
  return rows[0] as unknown as PromoWeb;
}

export async function updatePromoWeb(id: number, d: UpdatePromoWebData): Promise<PromoWeb | null> {
  const sql = getDb();
  await ensurePromosWebTable();
  const rows = await sql`
    UPDATE promos_web SET
      tag         = CASE WHEN ${d.tag !== undefined} THEN ${d.tag ?? ""} ELSE tag END,
      title       = CASE WHEN ${d.title !== undefined} THEN ${d.title ?? ""} ELSE title END,
      description = CASE WHEN ${d.description !== undefined} THEN ${d.description ?? ""} ELSE description END,
      prizes      = CASE WHEN ${d.prizes !== undefined} THEN ${JSON.stringify(d.prizes ?? [])}::jsonb ELSE prizes END,
      cta         = CASE WHEN ${d.cta !== undefined} THEN ${d.cta ?? ""} ELSE cta END,
      href        = CASE WHEN ${d.href !== undefined} THEN ${d.href ?? ""} ELSE href END,
      finalizado  = CASE WHEN ${d.finalizado !== undefined} THEN ${d.finalizado ?? false} ELSE finalizado END,
      activo      = CASE WHEN ${d.activo !== undefined} THEN ${d.activo ?? true} ELSE activo END,
      orden       = CASE WHEN ${d.orden !== undefined} THEN ${d.orden ?? 0} ELSE orden END
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as PromoWeb) ?? null;
}

export async function deletePromoWeb(id: number): Promise<void> {
  const sql = getDb();
  await ensurePromosWebTable();
  await sql`DELETE FROM promos_web WHERE id = ${id}`;
}
