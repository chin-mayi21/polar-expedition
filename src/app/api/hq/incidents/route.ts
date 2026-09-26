import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { listIncidentsForExpeditions } from "@/lib/emergency/queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const incidents = await listIncidentsForExpeditions(session.expeditionIds);
  return NextResponse.json({ incidents });
}
