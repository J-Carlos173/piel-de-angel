import { getDb, getSetting, setSetting } from "./db";

export type Tarea = {
  id: number;
  tipo: "tarea" | "nota";
  titulo: string;
  detalle: string | null;
  responsable: string | null;
  vence: string | null;
  hecha: boolean;
  created_at: string;
  done_at: string | null;
};

type Semilla = Pick<Tarea, "tipo" | "titulo" | "detalle" | "responsable" | "vence">;

const SEMILLA: Semilla[] = [
  {
    tipo: "tarea",
    titulo: "Crear el perfil de Google Business",
    detalle:
      "Es lo que más ayuda a aparecer en Google y en el mapa. Al crearlo, elegir \"negocio que atiende a domicilio\", ocultar la dirección y marcar las comunas: Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Agregar los servicios, fotos y horario.",
    responsable: "Tere",
    vence: "2026-09-21",
  },
  {
    tipo: "tarea",
    titulo: "Verificar el sitio en Google Search Console",
    detalle:
      "Entrar a search.google.com/search-console y agregar pieldeangel.cl. Google entrega un código: mandárselo a Carlos para dejarlo en el sitio. Después enviar el mapa del sitio (pieldeangel.cl/sitemap.xml) y pedir que revisen las páginas de servicios. Sirve para ver en qué puesto sales de verdad.",
    responsable: "Tere",
    vence: "2026-09-21",
  },
  {
    tipo: "tarea",
    titulo: "Revisar los textos de las páginas de cada servicio",
    detalle:
      "Las páginas de Lifting de pestañas, Limpieza facial, Hidratación, Laminado y Perfilado de cejas y Anti-edad tienen texto general del tratamiento. Revisar que la duración, los cuidados y las preguntas frecuentes coincidan con cómo trabaja Tere de verdad, y pedir los cambios en el Asistente IA.",
    responsable: "Tere",
    vence: "2026-09-21",
  },
  {
    tipo: "tarea",
    titulo: "Páginas propias para cada producto",
    detalle:
      "Hoy cada producto se abre en una ventana dentro de la tienda y no tiene su propia dirección. Con una página por producto, Google puede mostrarlos cuando alguien busca \"sérum coreano\" o \"protector solar coreano\".",
    responsable: "Claude",
    vence: null,
  },
  {
    tipo: "tarea",
    titulo: "Activar Google Merchant Center (productos gratis en Google)",
    detalle:
      "Muestra los productos con foto y precio en Google, sin costo. Se hace después de tener las páginas de productos. Google pide datos de envíos y devoluciones.",
    responsable: "Tere",
    vence: null,
  },
  {
    tipo: "tarea",
    titulo: "Pedir reseñas en Google después de cada compra o servicio",
    detalle:
      "Cuando exista el perfil de Google Business: copiar el enlace para dejar reseñas y mandarlo por WhatsApp, pidiendo que mencionen el servicio (por ejemplo \"lifting de pestañas\"). Es lo que más pesa en las búsquedas locales.",
    responsable: "Tere",
    vence: null,
  },
  {
    tipo: "tarea",
    titulo: "Poner pieldeangel.cl/links en la biografía de Instagram",
    detalle:
      "Instagram deja un solo enlace en la biografía. Esa página junta la tienda, los servicios, los consejos y el WhatsApp.",
    responsable: "Tere",
    vence: null,
  },
  {
    tipo: "tarea",
    titulo: "Agregar un consejo nuevo a /consejos cada semana o dos",
    detalle:
      "Es contenido barato de mantener y le da a Google motivos para volver. Se pide en el Asistente IA: \"escribe un consejo nuevo sobre…\".",
    responsable: "Claude",
    vence: null,
  },
  {
    tipo: "nota",
    titulo: "Google tarda en mostrar las páginas nuevas",
    detalle:
      "Las páginas nuevas (servicios, consejos, productos) pueden tardar de días a semanas en aparecer en Google. No es un error. Search Console permite pedir que las revisen antes.",
    responsable: null,
    vence: null,
  },
  {
    tipo: "nota",
    titulo: "Comunas de atención a domicilio",
    detalle:
      "Las páginas dicen que se atiende en Vitacura, Lo Barnechea, Las Condes, Providencia y Ñuñoa. Ñuñoa es la menos alta de las cinco: decidir si se mantiene o si se suma La Reina. Se cambia en un solo lugar.",
    responsable: null,
    vence: null,
  },
  {
    tipo: "nota",
    titulo: "Botón \"Reservar Hora\" de la barra superior",
    detalle: "Sigue diciendo Reservar Hora. Decidir si pasa a decir \"Tienda\" ahora que la tienda es el foco del sitio.",
    responsable: null,
    vence: null,
  },
  {
    tipo: "nota",
    titulo: "Publicidad (Meta o Google) y el aviso de cookies",
    detalle:
      "El aviso de cookies ya está listo. Antes de instalar cualquier píxel de publicidad hay que condicionarlo a que la persona acepte las cookies. Pedirlo cuando llegue el momento.",
    responsable: null,
    vence: null,
  },
  {
    tipo: "nota",
    titulo: "Domicilio legal en Términos y Condiciones",
    detalle:
      "Términos y Condiciones muestra el domicilio legal de la empresa (La Pintana). Es un dato obligatorio para vender online: solo se cambia si cambia el domicilio legal real, no por el de atención.",
    responsable: null,
    vence: null,
  },
];

export async function ensureTareasTable() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS admin_tareas (
      id          SERIAL PRIMARY KEY,
      tipo        VARCHAR(10) NOT NULL DEFAULT 'tarea',
      titulo      TEXT NOT NULL,
      detalle     TEXT,
      responsable VARCHAR(40),
      vence       DATE,
      hecha       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      done_at     TIMESTAMPTZ
    )
  `;
  // Se carga la lista inicial una sola vez; si Tere borra todo, no vuelve a aparecer.
  if ((await getSetting("tareas_semilla")) === null) {
    for (const s of SEMILLA) {
      await sql`
        INSERT INTO admin_tareas (tipo, titulo, detalle, responsable, vence)
        VALUES (${s.tipo}, ${s.titulo}, ${s.detalle}, ${s.responsable}, ${s.vence})
      `;
    }
    await setSetting("tareas_semilla", "1");
  }
}

export async function getAllTareas(): Promise<Tarea[]> {
  const sql = getDb();
  await ensureTareasTable();
  const rows = await sql`
    SELECT id, tipo, titulo, detalle, responsable, to_char(vence, 'YYYY-MM-DD') AS vence, hecha, created_at, done_at
    FROM admin_tareas
    ORDER BY hecha ASC, vence ASC NULLS LAST, id ASC
  `;
  return rows as unknown as Tarea[];
}

export async function countTareasPendientes(): Promise<number> {
  const sql = getDb();
  await ensureTareasTable();
  const rows = await sql`SELECT COUNT(*)::int AS n FROM admin_tareas WHERE tipo = 'tarea' AND hecha = FALSE`;
  return Number((rows[0] as { n: number }).n);
}

export async function createTarea(d: {
  tipo: "tarea" | "nota";
  titulo: string;
  detalle?: string;
  responsable?: string;
  vence?: string;
}): Promise<Tarea> {
  const sql = getDb();
  await ensureTareasTable();
  const rows = await sql`
    INSERT INTO admin_tareas (tipo, titulo, detalle, responsable, vence)
    VALUES (${d.tipo}, ${d.titulo}, ${d.detalle || null}, ${d.responsable || null}, ${d.vence || null}::date)
    RETURNING id, tipo, titulo, detalle, responsable, to_char(vence, 'YYYY-MM-DD') AS vence, hecha, created_at, done_at
  `;
  return rows[0] as unknown as Tarea;
}

export async function updateTarea(
  id: number,
  d: { titulo?: string; detalle?: string | null; responsable?: string | null; vence?: string | null; hecha?: boolean }
): Promise<Tarea | null> {
  const sql = getDb();
  await ensureTareasTable();
  const rows = await sql`
    UPDATE admin_tareas SET
      titulo      = CASE WHEN ${d.titulo !== undefined} THEN ${d.titulo ?? null} ELSE titulo END,
      detalle     = CASE WHEN ${d.detalle !== undefined} THEN ${d.detalle ?? null} ELSE detalle END,
      responsable = CASE WHEN ${d.responsable !== undefined} THEN ${d.responsable ?? null} ELSE responsable END,
      vence       = CASE WHEN ${d.vence !== undefined} THEN ${d.vence ?? null}::date ELSE vence END,
      hecha       = CASE WHEN ${d.hecha !== undefined} THEN ${d.hecha ?? false} ELSE hecha END,
      done_at     = CASE WHEN ${d.hecha !== undefined} THEN (CASE WHEN ${d.hecha ?? false} THEN NOW() ELSE NULL END) ELSE done_at END
    WHERE id = ${id}
    RETURNING id, tipo, titulo, detalle, responsable, to_char(vence, 'YYYY-MM-DD') AS vence, hecha, created_at, done_at
  `;
  return (rows[0] as unknown as Tarea) ?? null;
}

export async function deleteTarea(id: number): Promise<void> {
  const sql = getDb();
  await ensureTareasTable();
  await sql`DELETE FROM admin_tareas WHERE id = ${id}`;
}
