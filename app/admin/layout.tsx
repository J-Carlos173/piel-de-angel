import { getSetting } from "@/lib/db";
import AdminAmbient from "./AdminAmbient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let fondo: string | null = null;
  try {
    fondo = await getSetting("site_background");
  } catch {}

  return <AdminAmbient fondo={fondo}>{children}</AdminAmbient>;
}
