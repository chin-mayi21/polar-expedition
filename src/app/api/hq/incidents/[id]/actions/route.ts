import { NextResponse } from "next/server";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import {
  canPerformIncidentAction,
  statusAfterIncidentAction,
} from "@/lib/emergency/incident-actions";
import { getIncidentForScope } from "@/lib/emergency/queries";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum([
    "acknowledge",
    "start_investigation",
    "activate_response",
    "resolve",
    "close",
  ]),
  statusSummary: z.string().min(3).max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const incident = await getIncidentForScope(id, session.expeditionIds);
  if (!incident) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, statusSummary } = parsed.data;
  if (!canPerformIncidentAction(incident.status, action)) {
    return NextResponse.json(
      { error: `Action "${action}" not allowed from status ${incident.status}.` },
      { status: 422 }
    );
  }

  const newStatus = statusAfterIncidentAction(incident.status, action);
  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.incident.update({
      where: { id },
      data: {
        status: newStatus,
        acknowledgedAt:
          action === "acknowledge" ? now : incident.acknowledgedAt ?? undefined,
        resolvedAt: action === "resolve" ? now : incident.resolvedAt ?? undefined,
        currentStatusSummary: statusSummary ?? incident.currentStatusSummary,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: incident.expeditionId,
        entityType: "Incident",
        entityId: id,
        action: AuditAction.STATUS_CHANGE,
        previousState: JSON.stringify({ status: incident.status }),
        newState: JSON.stringify({ status: newStatus, statusSummary }),
      },
    });
    return row;
  });

  return NextResponse.json({ incident: updated });
}
