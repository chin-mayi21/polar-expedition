import { NextResponse } from "next/server";
import { z } from "zod";
import { CargoItemStatus, CargoEventType } from "@prisma/client";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import {
  evidenceSchemaForTransition,
  issueEvidenceSchema,
  nextPipelineStatus,
} from "@/lib/cargo/pipeline";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("advance"), evidence: z.record(z.string(), z.unknown()) }),
  z.object({ kind: z.literal("delayed"), evidence: issueEvidenceSchema }),
  z.object({ kind: z.literal("damaged"), evidence: issueEvidenceSchema }),
]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.cargoItem.findUnique({ where: { id } });
  if (!item || !session.expeditionIds.includes(item.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let toStatus: CargoItemStatus;
  let note: string;

  if (parsed.data.kind === "delayed") {
    toStatus = CargoItemStatus.DELAYED;
    note = JSON.stringify({ type: "DELAYED", ...parsed.data.evidence });
  } else if (parsed.data.kind === "damaged") {
    toStatus = CargoItemStatus.DAMAGED;
    note = JSON.stringify({ type: "DAMAGED", ...parsed.data.evidence });
  } else {
    const next = nextPipelineStatus(item.status);
    if (!next) {
      return NextResponse.json({ error: "No further pipeline stage from current status." }, { status: 422 });
    }
    toStatus = next;
    const schema = evidenceSchemaForTransition(item.status, toStatus);
    if (!schema) {
      return NextResponse.json({ error: "Evidence schema missing for transition." }, { status: 500 });
    }
    const ev = schema.safeParse(parsed.data.evidence);
    if (!ev.success) {
      return NextResponse.json({ error: "Evidence validation failed", details: ev.error.flatten() }, { status: 400 });
    }
    note = JSON.stringify(ev.data);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cargo = await tx.cargoItem.update({
      where: { id },
      data: { status: toStatus },
    });
    await tx.cargoEvent.create({
      data: {
        cargoItemId: id,
        eventType: CargoEventType.STATUS_CHANGE,
        fromStatus: item.status,
        toStatus,
        note,
        actorUserId: session.id,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: item.expeditionId,
        entityType: "CargoItem",
        entityId: id,
        action: "STATUS_CHANGE",
        previousState: JSON.stringify({ status: item.status }),
        newState: JSON.stringify({ status: toStatus }),
      },
    });
    return cargo;
  });

  return NextResponse.json({ item: updated });
}
