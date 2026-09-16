import { NextRequest } from "next/server";

export function isAdminAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_auth");
  const adminPass = process.env.ADMIN_PASSWORD || "pieldeangel2024";
  const expected = Buffer.from(adminPass).toString("base64");
  return !!cookie && cookie.value === expected;
}
