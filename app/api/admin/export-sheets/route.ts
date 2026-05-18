import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
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

export async function POST() {
  try {
    const orders = await getAllOrders();

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
        o.customer_nombre || "",
        o.customer_email || "",
        o.customer_tel || "",
        [o.customer_dir, o.customer_depto, o.customer_ciudad, o.customer_region].filter(Boolean).join(", "),
        o.zona === "santiago" ? "Santiago (RM)" : "Regiones",
        items,
        o.envio === 0 ? "Gratis" : fmtPrecio(Number(o.envio)),
        fmtPrecio(Number(o.amount || o.total)),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // Ancho de columnas
    ws["!cols"] = [16, 10, 18, 18, 22, 28, 14, 36, 14, 40, 10, 12].map((w) => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Órdenes");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fecha = new Date().toISOString().slice(0, 10);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="ordenes-${fecha}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("[export-sheets]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
