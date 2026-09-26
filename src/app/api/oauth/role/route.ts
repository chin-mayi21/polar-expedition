import { NextResponse } from "next/server";
import { setOAuthRoleCookie } from "@/lib/auth/oauth-role-cookie";
import { isUserRole } from "@/lib/auth/role-entry";
import type { UserRole } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const role = typeof body?.role === "string" && isUserRole(body.role) ? (body.role as UserRole) : null;
  if (!role) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  await setOAuthRoleCookie(role);
  return NextResponse.json({ ok: true });
}
