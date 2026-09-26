import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { generateMissionReport } from "@/lib/reports/mission-report";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const report = await generateMissionReport(id, session.expeditionIds);
  if (!report) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  return NextResponse.json({ report });
}
