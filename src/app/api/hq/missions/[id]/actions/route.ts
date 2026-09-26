import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { canPerformAction, statusAfterAction } from "@/lib/missions/actions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum(["activate", "mark_delayed", "mark_returned", "cancel"]),
  reason: z.string().min(3).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const mission = await prisma.mission.findUnique({ where: { id } });
  if (!mission || !session.expeditionIds.includes(mission.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, reason } = parsed.data;
  if (!canPerformAction(mission.status, action)) {
    return NextResponse.json(
      { error: `Action "${action}" is not allowed from status ${mission.status}.` },
      { status: 422 }
    );
  }

  if ((action === "mark_delayed" || action === "cancel") && !reason) {
    return NextResponse.json({ error: "Reason is required for this action." }, { status: 400 });
  }

  const newStatus = statusAfterAction(mission.status, action);

  const updated = await prisma.$transaction(async (tx) => {
    const m = await tx.mission.update({
      where: { id },
      data: {
        status: newStatus,
        actualReturnAt: action === "mark_returned" ? new Date() : mission.actualReturnAt,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: mission.expeditionId,
        entityType: "Mission",
        entityId: id,
        action: "STATUS_CHANGE",
        previousState: JSON.stringify({ status: mission.status }),
        newState: JSON.stringify({ status: newStatus, reason }),
      },
    });
    return m;
  });

  return NextResponse.json({ mission: updated });
}
