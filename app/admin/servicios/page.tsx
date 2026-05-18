import { requireAdmin } from "@/lib/auth";
import ServiciosAdminClient from "./ServiciosAdminClient";

export default async function ServiciosAdminPage() {
  await requireAdmin();
  return <ServiciosAdminClient />;
}
