import { getDb, getSetting, setSetting } from "./db";

export type Consejo = {
  id: number;
  categoria: string;
  titulo: string;
  texto: string;
  fuente: string;
  imagen: string;
  icono: string;
  activo: boolean;
  orden: number;
  created_at: string;
};

type CreateConsejoData = Omit<Consejo, "id" | "created_at">;
type UpdateConsejoData = Partial<CreateConsejoData>;

// Los mismos 9 consejos que ya estaban escritos en el código, para no perderlos al pasar a la base de datos.
const SEMILLA: Omit<CreateConsejoData, "activo" | "orden">[] = [
  {
    categoria: "Protección solar",
    titulo: "El protector solar va todos los días, incluso con nublado",
    texto: "Los rayos UVA atraviesan las nubes y los vidrios. Aplicar protector solar a diario es, según dermatólogos, el hábito con mayor impacto para prevenir el envejecimiento prematuro y las manchas.",
    fuente: "Academia Americana de Dermatología",
    imagen: "https://3k2x20xraaunghs0.public.blob.vercel-storage.com/productos/1783216888973-4D023E27-E9A5-462E-A0D4-A0CC078AB317.jpeg",
    icono: "",
  },
  {
    categoria: "Limpieza",
    titulo: "Doble limpieza si usas maquillaje o protector solar",
    texto: "Un primer paso con aceite o bálsamo limpiador para disolver maquillaje y filtro solar, seguido de un limpiador suave con agua, deja la piel realmente limpia sin resecarla.",
    fuente: "Fundación Piel Sana (AEDV)",
    imagen: "https://3k2x20xraaunghs0.public.blob.vercel-storage.com/productos/1784348350858-811C9C72-1134-4642-904B-035C2DF486A5.jpeg",
    icono: "",
  },
  {
    categoria: "Exfoliación",
    titulo: "Menos es más: 1 a 3 veces por semana alcanza",
    texto: "Exfoliar todos los días daña la barrera cutánea y genera más sensibilidad, no menos. Con ácidos suaves (como los AHA/BHA) unas pocas veces por semana es suficiente para renovar la piel.",
    fuente: "Academia Americana de Dermatología",
    imagen: "",
    icono: "fa-solid fa-sparkles",
  },
  {
    categoria: "Retinol",
    titulo: "Retinol de noche, protector solar de día",
    texto: "El retinol vuelve la piel más sensible al sol. Se recomienda usarlo solo en la rutina nocturna y reforzar el protector solar al día siguiente, siempre partiendo con una concentración baja.",
    fuente: "Fundación Piel Sana (AEDV)",
    imagen: "",
    icono: "fa-solid fa-moon",
  },
  {
    categoria: "Hidratación",
    titulo: "El ácido hialurónico funciona mejor en piel húmeda",
    texto: "Este activo atrae agua hacia la piel. Aplicarlo sobre el rostro recién lavado y húmedo, y sellar después con una crema, evita el efecto contrario de resecar en ambientes secos.",
    fuente: "Academia Americana de Dermatología",
    imagen: "https://3k2x20xraaunghs0.public.blob.vercel-storage.com/productos/1784347592813-CE263271-75B2-4283-9F9E-2372074E0A3F.jpeg",
    icono: "",
  },
  {
    categoria: "Nuevos productos",
    titulo: "Antes de usar algo nuevo, haz una prueba de parche",
    texto: "Aplica una pequeña cantidad en el antebrazo o detrás de la oreja y espera 24 a 48 horas. Es la forma más simple de anticipar una alergia o irritación antes de usarlo en el rostro.",
    fuente: "Organización Mundial de la Salud",
    imagen: "",
    icono: "fa-solid fa-flask",
  },
  {
    categoria: "Rutina",
    titulo: "No mezcles activos fuertes el mismo día",
    texto: "Combinar retinol con ácidos exfoliantes fuertes, o vitamina C con retinol en la misma rutina, puede irritar la piel. Alternar noches o usarlos en momentos distintos del día es más seguro.",
    fuente: "Fundación Piel Sana (AEDV)",
    imagen: "",
    icono: "fa-solid fa-layer-group",
  },
  {
    categoria: "Piel grasa",
    titulo: "La piel grasa también necesita hidratación",
    texto: "Saltarse la crema hidratante para 'no engrasar más' suele causar el efecto contrario: la piel produce más grasa para compensar. Una hidratación ligera, sin aceite, mantiene el equilibrio.",
    fuente: "Academia Americana de Dermatología",
    imagen: "",
    icono: "fa-solid fa-droplet",
  },
  {
    categoria: "Estacionalidad",
    titulo: "La rutina cambia con el clima",
    texto: "En invierno la piel suele necesitar cremas más densas y menos exfoliación; en verano, texturas más ligeras y reforzar el protector solar. Adaptar la rutina evita irritaciones de temporada.",
    fuente: "Fundación Piel Sana (AEDV)",
    imagen: "",
    icono: "fa-solid fa-cloud-sun",
  },
  {
    categoria: "Hábitos",
    titulo: "El descanso también se nota en la piel",
    texto: "Dormir mal se asocia a mayor inflamación y peor recuperación de la barrera cutánea. Ningún sérum reemplaza un buen descanso como base de una piel sana.",
    fuente: "Organización Mundial de la Salud",
    imagen: "",
    icono: "fa-solid fa-bed",
  },
];

export async function ensureConsejosTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS consejos (
      id          SERIAL PRIMARY KEY,
      categoria   VARCHAR(100) NOT NULL DEFAULT '',
      titulo      VARCHAR(300) NOT NULL DEFAULT '',
      texto       TEXT NOT NULL DEFAULT '',
      fuente      VARCHAR(200) NOT NULL DEFAULT '',
      imagen      TEXT NOT NULL DEFAULT '',
      icono       VARCHAR(60) NOT NULL DEFAULT '',
      activo      BOOLEAN NOT NULL DEFAULT TRUE,
      orden       INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  if ((await getSetting("consejos_semilla")) === null) {
    for (let i = 0; i < SEMILLA.length; i++) {
      const s = SEMILLA[i];
      await sql`
        INSERT INTO consejos (categoria, titulo, texto, fuente, imagen, icono, orden)
        VALUES (${s.categoria}, ${s.titulo}, ${s.texto}, ${s.fuente}, ${s.imagen}, ${s.icono}, ${i})
      `;
    }
    await setSetting("consejos_semilla", "1");
  }
}

export async function getAllConsejos(): Promise<Consejo[]> {
  const sql = getDb();
  await ensureConsejosTable();
  const rows = await sql`SELECT * FROM consejos ORDER BY orden ASC, id ASC`;
  return rows as unknown as Consejo[];
}

export async function getActiveConsejos(): Promise<Consejo[]> {
  const sql = getDb();
  await ensureConsejosTable();
  const rows = await sql`SELECT * FROM consejos WHERE activo = TRUE ORDER BY orden ASC, id ASC`;
  return rows as unknown as Consejo[];
}

export async function createConsejo(d: CreateConsejoData): Promise<Consejo> {
  const sql = getDb();
  await ensureConsejosTable();
  const rows = await sql`
    INSERT INTO consejos (categoria, titulo, texto, fuente, imagen, icono, activo, orden)
    VALUES (
      ${d.categoria}, ${d.titulo}, ${d.texto}, ${d.fuente}, ${d.imagen || ""}, ${d.icono || ""},
      ${d.activo ?? true}, ${d.orden ?? 0}
    )
    RETURNING *
  `;
  return rows[0] as unknown as Consejo;
}

export async function updateConsejo(id: number, d: UpdateConsejoData): Promise<Consejo | null> {
  const sql = getDb();
  await ensureConsejosTable();
  const rows = await sql`
    UPDATE consejos SET
      categoria = CASE WHEN ${d.categoria !== undefined} THEN ${d.categoria ?? ""} ELSE categoria END,
      titulo    = CASE WHEN ${d.titulo !== undefined} THEN ${d.titulo ?? ""} ELSE titulo END,
      texto     = CASE WHEN ${d.texto !== undefined} THEN ${d.texto ?? ""} ELSE texto END,
      fuente    = CASE WHEN ${d.fuente !== undefined} THEN ${d.fuente ?? ""} ELSE fuente END,
      imagen    = CASE WHEN ${d.imagen !== undefined} THEN ${d.imagen ?? ""} ELSE imagen END,
      icono     = CASE WHEN ${d.icono !== undefined} THEN ${d.icono ?? ""} ELSE icono END,
      activo    = CASE WHEN ${d.activo !== undefined} THEN ${d.activo ?? true} ELSE activo END,
      orden     = CASE WHEN ${d.orden !== undefined} THEN ${d.orden ?? 0} ELSE orden END
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as unknown as Consejo) ?? null;
}

export async function deleteConsejo(id: number): Promise<void> {
  const sql = getDb();
  await ensureConsejosTable();
  await sql`DELETE FROM consejos WHERE id = ${id}`;
}
