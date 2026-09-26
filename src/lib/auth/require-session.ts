import { auth } from "@/auth";
import { buildSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/types";
import { NextResponse } from "next/server";

export async function requireSession(): Promise<SessionUser | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await buildSessionUser(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireHqOfficial(): Promise<SessionUser | NextResponse> {
  const result = await requireSession();
  if (result instanceof NextResponse) return result;
  if (result.role !== "OPERATIONS_OFFICIAL") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

export async function requireFamilyNok(): Promise<SessionUser | NextResponse> {
  const result = await requireSession();
  if (result instanceof NextResponse) return result;
  if (result.role !== "FAMILY_NOK" || !result.nextOfKinForId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

export async function requireFieldPersonnel(): Promise<SessionUser | NextResponse> {
  const result = await requireSession();
  if (result instanceof NextResponse) return result;
  if (result.role !== "FIELD_PERSONNEL" || !result.personnelId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

export function isSessionUser(v: SessionUser | NextResponse): v is SessionUser {
  return !(v instanceof NextResponse);
}
