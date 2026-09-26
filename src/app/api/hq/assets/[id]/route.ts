import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const patchSchema = z.object({
  status: z.enum(["OPERATIONAL", "MAINTENANCE", "DECOMMISSIONED"]),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || !session.expeditionIds.includes(asset.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const a = await tx.asset.update({
      where: { id },
      data: {
        status: parsed.data.status,
        lastServiceAt: parsed.data.status === "MAINTENANCE" ? new Date() : asset.lastServiceAt,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: asset.expeditionId,
        entityType: "Asset",
        entityId: id,
        action: "STATUS_CHANGE",
        previousState: JSON.stringify({ status: asset.status }),
        newState: JSON.stringify({ status: parsed.data.status }),
      },
    });
    return a;
  });

  return NextResponse.json({ asset: updated });
}
