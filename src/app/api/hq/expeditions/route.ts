import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createSchema = z.object({
  code: z.string().min(3).max(32),
  name: z.string().min(3),
  season: z.string().min(4),
});

export async function POST(request: Request) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.expedition.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "Expedition code already exists." }, { status: 409 });
  }

  const expedition = await prisma.$transaction(async (tx) => {
    const ex = await tx.expedition.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        season: parsed.data.season,
        status: "DRAFT",
        readinessItems: {
          create: [
            { key: "personnel_roster", label: "Personnel roster approved" },
            { key: "cargo_manifest", label: "Outbound cargo manifest verified" },
            { key: "medical_clearance", label: "Medical clearance complete" },
            { key: "comms_plan", label: "Communications plan signed off" },
            { key: "emergency_contacts", label: "Emergency contacts & response process" },
          ],
        },
      },
    });
    await tx.userExpeditionScope.create({
      data: { userId: session.id, expeditionId: ex.id },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: ex.id,
        entityType: "Expedition",
        entityId: ex.id,
        action: "CREATE",
        newState: JSON.stringify({ code: ex.code }),
      },
    });
    return ex;
  });

  return NextResponse.json({ expedition });
}

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const expeditions = await prisma.expedition.findMany({
    where: { id: { in: session.expeditionIds } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ expeditions });
}
