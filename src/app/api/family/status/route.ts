import { NextResponse } from "next/server";
import { isSessionUser, requireFamilyNok } from "@/lib/auth/require-session";
import { getFamilyStatusForLinkedMember } from "@/lib/family/status";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireFamilyNok();
  if (!isSessionUser(session)) return session;

  const status = await getFamilyStatusForLinkedMember(session.nextOfKinForId!);
  if (!status) {
    return NextResponse.json({ error: "Linked member not found" }, { status: 404 });
  }

  return NextResponse.json({ status });
}
