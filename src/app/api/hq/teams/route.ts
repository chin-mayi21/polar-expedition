import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  expeditionId: z.string(),
  stationId: z.string().optional(),
  name: z.string().min(2),
  callsign: z.string().optional(),
});

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const teams = await prisma.team.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: { station: true, _count: { select: { personnel: true, missions: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!session.expeditionIds.includes(parsed.data.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const team = await prisma.team.create({ data: parsed.data });
  return NextResponse.json({ team });
}
