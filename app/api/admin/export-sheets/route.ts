import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getAllOrders } from "@/lib/db";

function fmtPrecio(n: number) {
  return "$" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function fmtFecha(d: string) {
  return new Date(d).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago",
  });
}

export async function POST(_req: NextRequest) {
  try {
    const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyRaw) return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_KEY no configurada" }, { status: 500 });

    const credentials = JSON.parse(keyRaw);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    const orders = await getAllOrders();
    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    const fecha = new Date().toLocaleDateString("es-CL");

    // Crear el archivo como Google Sheet vía Drive API (esto da control total de permisos)
    const file = await drive.files.create({
      requestBody: {
        name: `Órdenes Piel de Ángel · ${fecha}`,
        mimeType: "application/vnd.google-apps.spreadsheet",
      },
      fields: "id",
    });

    const spreadsheetId = file.data.id!;

    // Armar filas
    const header = ["Orden", "Estado", "Fecha creación", "Fecha pago", "Nombre", "Email", "Teléfono", "Dirección", "Zona", "Productos", "Envío", "Total"];
    const rows = (orders as Record<string, unknown>[]).map((o) => {
      const items = Array.isArray(o.items)
        ? (o.items as { nombre: string; qty: number }[]).map((i) => `${i.nombre} ×${i.qty}`).join(", ")
        : "";
      return [
        o.buy_order,
        o.status === "confirmed" ? "Pagado" : "Pendiente",
        fmtFecha(o.created_at as string),
        o.confirmed_at ? fmtFecha(o.confirmed_at as string) : "—",
        o.customer_nombre || "", o.customer_email || "", o.customer_tel || "",
        [o.customer_dir, o.customer_depto, o.customer_ciudad, o.customer_region].filter(Boolean).join(", "),
        o.zona === "santiago" ? "Santiago (RM)" : "Regiones",
        items,
        o.envio === 0 ? "Gratis" : fmtPrecio(Number(o.envio)),
        fmtPrecio(Number(o.amount || o.total)),
      ];
    });

    // Escribir datos
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: { values: [header, ...rows] },
    });

    // Formato bonito: cabecera rosada, negrita, columnas ajustadas, fila fija
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.85, green: 0.67, blue: 0.58 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
                  horizontalAlignment: "CENTER",
                },
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
            },
          },
          {
            updateSheetProperties: {
              properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
              fields: "gridProperties.frozenRowCount",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: { sheetId: 0, dimension: "COLUMNS", startIndex: 0, endIndex: 12 },
            },
          },
        ],
      },
    });

    // Compartir con cualquiera que tenga el link (editor)
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: { role: "writer", type: "anyone" },
      fields: "id",
    });

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[export-sheets]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
