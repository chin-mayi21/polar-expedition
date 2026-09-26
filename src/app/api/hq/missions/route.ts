import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  expeditionId: z.string(),
  teamId: z.string(),
  title: z.string().min(3),
  code: z.string().min(3),
  plannedDepartAt: z.string().datetime(),
  expectedReturnAt: z.string().datetime(),
  checkInIntervalMinutes: z.coerce.number().int().min(30).max(720),
  personnelIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!session.expeditionIds.includes(parsed.data.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mission = await prisma.mission.create({
    data: {
      expeditionId: parsed.data.expeditionId,
      teamId: parsed.data.teamId,
      title: parsed.data.title,
      code: parsed.data.code,
      plannedDepartAt: new Date(parsed.data.plannedDepartAt),
      expectedReturnAt: new Date(parsed.data.expectedReturnAt),
      checkInIntervalMinutes: parsed.data.checkInIntervalMinutes,
      personnel: parsed.data.personnelIds?.length
        ? { create: parsed.data.personnelIds.map((pid) => ({ personnelId: pid })) }
        : undefined,
    },
  });

  return NextResponse.json({ mission });
}

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const missions = await prisma.mission.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: {
      team: true,
      lead: true,
      personnel: { include: { personnel: true } },
      _count: { select: { checkIns: true } },
    },
    orderBy: { plannedDepartAt: "desc" },
  });

  return NextResponse.json({ missions });
}
