import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { evaluateExpeditionReadiness } from "@/lib/expedition/readiness";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  if (!session.expeditionIds.includes(id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const expedition = await prisma.expedition.findUnique({ where: { id } });
  if (!expedition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (expedition.status === "ACTIVE") {
    return NextResponse.json({ error: "Expedition is already active." }, { status: 400 });
  }

  const readiness = await evaluateExpeditionReadiness(id);
  if (!readiness.pass) {
    return NextResponse.json(
      { error: "Readiness gate failed.", blockers: readiness.blockers },
      { status: 422 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const ex = await tx.expedition.update({
      where: { id },
      data: { status: "ACTIVE", activatedAt: new Date() },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: id,
        entityType: "Expedition",
        entityId: id,
        action: "ACTIVATE",
        previousState: JSON.stringify({ status: expedition.status }),
        newState: JSON.stringify({ status: "ACTIVE" }),
      },
    });
    return ex;
  });

  return NextResponse.json({ ok: true, expedition: updated });
}
