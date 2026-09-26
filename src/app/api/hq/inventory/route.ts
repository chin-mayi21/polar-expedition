import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { listInventoryForExpeditions } from "@/lib/inventory/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const items = await listInventoryForExpeditions(session.expeditionIds);
  return NextResponse.json({ items });
}
