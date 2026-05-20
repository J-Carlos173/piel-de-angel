export const dynamic = "force-dynamic";

import { getSetting } from "@/lib/db";
import NotificacionesClient from "./NotificacionesClient";

export default async function NotificacionesPage() {
  const [compras, citas, seguridad] = await Promise.all([
    getSetting("notif_compras").catch(() => null),
    getSetting("notif_citas").catch(() => null),
    getSetting("notif_seguridad").catch(() => null),
  ]);

  return (
    <NotificacionesClient
      initial={{
        notif_compras:   compras   !== "false",
        notif_citas:     citas     !== "false",
        notif_seguridad: seguridad !== "false",
      }}
    />
  );
}
