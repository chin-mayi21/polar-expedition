import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { evaluateExpeditionReadiness } from "@/lib/expedition/readiness";
import { explainExpeditionReadiness } from "@/lib/expedition/readiness-explained";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  if (!session.expeditionIds.includes(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [result, explained, items] = await Promise.all([
    evaluateExpeditionReadiness(id),
    explainExpeditionReadiness(id),
    prisma.expeditionReadinessItem.findMany({
      where: { expeditionId: id },
      orderBy: { key: "asc" },
    }),
  ]);

  return NextResponse.json({ ...result, rules: explained.rules, checklist: items });
}
