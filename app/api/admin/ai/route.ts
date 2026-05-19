import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAllReviews, updateReviewStatus, deleteReview } from "@/lib/reviews-db";
import { getAllServicios, createServicio, updateServicio, deleteServicio } from "@/lib/services-db";
import { getDb } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Eres la asistente de administración de "Piel de Ángel", un salón de belleza y estética premium en Chile. Ayudas a Teresita, la dueña, a gestionar su sitio web directamente desde una conversación.

Puedes ver y moderar reseñas, gestionar servicios y productos, revisar la agenda y ver estadísticas. Cuando Tere te pida hacer algo, usa las herramientas para hacerlo de verdad — no solo expliques, actúa.

Sé amable, concisa y habla en español chileno natural. Si vas a eliminar algo, confirma antes de hacerlo a menos que Tere ya lo haya dicho claramente. Cuando ejecutes una acción, confirma brevemente que se hizo.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "ver_resenas",
    description: "Ve las reseñas de clientas. Puede filtrar por estado: pending (pendientes), approved (publicadas), o todas.",
    input_schema: {
      type: "object" as const,
      properties: {
        estado: { type: "string", enum: ["pending", "approved", "todas"], description: "Filtro de estado" }
      },
      required: []
    }
  },
  {
    name: "aprobar_resena",
    description: "Aprueba una reseña para que se publique en el sitio",
    input_schema: {
      type: "object" as const,
      properties: { id: { type: "string" } },
      required: ["id"]
    }
  },
  {
    name: "eliminar_resena",
    description: "Elimina una reseña definitivamente",
    input_schema: {
      type: "object" as const,
      properties: { id: { type: "string" } },
      required: ["id"]
    }
  },
  {
    name: "ocultar_resena",
    description: "Oculta una reseña publicada (la vuelve a pendiente)",
    input_schema: {
      type: "object" as const,
      properties: { id: { type: "string" } },
      required: ["id"]
    }
  },
  {
    name: "ver_servicios",
    description: "Ve todos los servicios del salón",
    input_schema: { type: "object" as const, properties: {}, required: [] }
  },
  {
    name: "crear_servicio",
    description: "Crea un nuevo servicio en el salón",
    input_schema: {
      type: "object" as const,
      properties: {
        title:       { type: "string", description: "Nombre del servicio" },
        description: { type: "string", description: "Descripción" },
        precio:      { type: "number", description: "Precio en CLP (0 = Consultar)" },
        duracion:    { type: "number", description: "Duración en minutos" },
        categoria:   { type: "string", description: "Categoría: Facial, Pestañas, Corporal, Hidratación, Tratamiento, Bienestar, Skincare" },
      },
      required: ["title"]
    }
  },
  {
    name: "actualizar_servicio",
    description: "Actualiza campos de un servicio existente",
    input_schema: {
      type: "object" as const,
      properties: {
        id:          { type: "string" },
        title:       { type: "string" },
        description: { type: "string" },
        precio:      { type: "number" },
        duracion:    { type: "number" },
        categoria:   { type: "string" },
        status:      { type: "string", enum: ["published", "draft"] },
      },
      required: ["id"]
    }
  },
  {
    name: "eliminar_servicio",
    description: "Elimina un servicio definitivamente",
    input_schema: {
      type: "object" as const,
      properties: { id: { type: "string" } },
      required: ["id"]
    }
  },
  {
    name: "ver_estadisticas",
    description: "Ve estadísticas de visitas del sitio: hoy, esta semana, este mes y total",
    input_schema: { type: "object" as const, properties: {}, required: [] }
  },
  {
    name: "ver_agenda",
    description: "Ve las próximas citas agendadas",
    input_schema: { type: "object" as const, properties: {}, required: [] }
  },
  {
    name: "ver_productos",
    description: "Ve el catálogo de productos de la tienda con stock y precios",
    input_schema: { type: "object" as const, properties: {}, required: [] }
  },
  {
    name: "actualizar_producto",
    description: "Actualiza stock o precio de un producto",
    input_schema: {
      type: "object" as const,
      properties: {
        id:     { type: "string" },
        stock:  { type: "number" },
        precio: { type: "number" },
      },
      required: ["id"]
    }
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  const sql = getDb();

  switch (name) {
    case "ver_resenas": {
      const all = await getAllReviews();
      const estado = input.estado as string;
      if (estado === "todas" || !estado) return all;
      return all.filter((r) => r.estado === estado);
    }
    case "aprobar_resena":
      await updateReviewStatus(input.id as string, "approved");
      return { ok: true, mensaje: "Reseña aprobada y publicada en el sitio" };

    case "eliminar_resena":
      await deleteReview(input.id as string);
      return { ok: true, mensaje: "Reseña eliminada" };

    case "ocultar_resena":
      await updateReviewStatus(input.id as string, "pending");
      return { ok: true, mensaje: "Reseña ocultada del sitio" };

    case "ver_servicios":
      return await getAllServicios();

    case "crear_servicio": {
      const s = await createServicio({
        title:       input.title as string,
        description: (input.description as string) ?? "",
        thumbnail:   "",
        status:      "published",
        precio:      Number(input.precio ?? 0),
        duracion:    Number(input.duracion ?? 0),
        categoria:   (input.categoria as string) ?? "",
        orden:       0,
      });
      return { ok: true, servicio: s };
    }
    case "actualizar_servicio": {
      const { id, ...fields } = input;
      const updated = await updateServicio(id as string, fields as Parameters<typeof updateServicio>[1]);
      return { ok: true, servicio: updated };
    }
    case "eliminar_servicio":
      await deleteServicio(input.id as string);
      return { ok: true, mensaje: "Servicio eliminado" };

    case "ver_estadisticas": {
      const rows = await sql`
        SELECT
          SUM(views) FILTER (WHERE date = (NOW() AT TIME ZONE 'America/Santiago')::date)::int AS hoy,
          SUM(views) FILTER (WHERE date >= (NOW() AT TIME ZONE 'America/Santiago')::date - 6)::int AS semana,
          SUM(views) FILTER (WHERE date >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Santiago')::date)::int AS mes,
          SUM(views)::int AS total
        FROM page_views
      `.catch(() => [{}]);
      return rows[0];
    }
    case "ver_agenda": {
      const rows = await sql`
        SELECT id, name, email, phone, service, date, time, status
        FROM bookings
        WHERE date >= CURRENT_DATE
        ORDER BY date ASC, time ASC
        LIMIT 20
      `.catch(() => []);
      return rows;
    }
    case "ver_productos": {
      const rows = await sql`
        SELECT id, title, categoria, precio, stock, status FROM products ORDER BY title ASC LIMIT 50
      `.catch(() => []);
      return rows;
    }
    case "actualizar_producto": {
      const { id, stock, precio } = input as { id: string; stock?: number; precio?: number };
      await sql`
        UPDATE products SET
          ${stock  !== undefined ? sql`stock  = ${stock},`  : sql``}
          ${precio !== undefined ? sql`precio = ${precio},` : sql``}
          updated_at = NOW()
        WHERE id = ${id}
      `.catch(() => {});
      return { ok: true, mensaje: "Producto actualizado" };
    }
    default:
      return { error: "Herramienta desconocida" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: Anthropic.MessageParam[] };

    let history: Anthropic.MessageParam[] = messages;
    const toolsUsed: string[] = [];

    // Bucle agente: Claude llama herramientas hasta tener respuesta final
    for (let i = 0; i < 10; i++) {
      const response = await client.messages.create({
        model:      "claude-opus-4-5",
        max_tokens: 2048,
        system:     SYSTEM,
        tools:      TOOLS,
        messages:   history,
      });

      if (response.stop_reason === "end_turn") {
        const text = response.content.find((b) => b.type === "text")?.text ?? "";
        return NextResponse.json({ reply: text, toolsUsed });
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];

        history.push({ role: "assistant", content: response.content });

        const results: Anthropic.ToolResultBlockParam[] = await Promise.all(
          toolUses.map(async (t) => {
            toolsUsed.push(t.name);
            const result = await runTool(t.name, t.input as Record<string, unknown>);
            return {
              type: "tool_result" as const,
              tool_use_id: t.id,
              content: JSON.stringify(result),
            };
          })
        );

        history.push({ role: "user", content: results });
        continue;
      }

      break;
    }

    return NextResponse.json({ reply: "No pude completar la acción.", toolsUsed });
  } catch (err) {
    console.error("[ai]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
