import { NextRequest } from "next/server";
import { adminTokenValido } from "./admin-token";

export function isAdminAuthorized(req: NextRequest): boolean {
  return adminTokenValido(req.cookies.get("admin_auth")?.value);
}
