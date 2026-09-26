import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createSchema = z.object({
  expeditionId: z.string(),
  stationId: z.string().optional(),
  assetTag: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  status: z.enum(["OPERATIONAL", "MAINTENANCE", "DECOMMISSIONED"]).optional(),
});

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const assets = await prisma.asset.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: { station: true },
    orderBy: { assetTag: "asc" },
  });

  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (!session.expeditionIds.includes(parsed.data.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const asset = await prisma.asset.create({
    data: {
      expeditionId: parsed.data.expeditionId,
      stationId: parsed.data.stationId ?? null,
      assetTag: parsed.data.assetTag,
      name: parsed.data.name,
      category: parsed.data.category,
      status: parsed.data.status ?? "OPERATIONAL",
    },
  });

  await prisma.auditEvent.create({
    data: {
      actorUserId: session.id,
      expeditionId: parsed.data.expeditionId,
      entityType: "Asset",
      entityId: asset.id,
      action: "CREATE",
      newState: JSON.stringify({ assetTag: asset.assetTag }),
    },
  });

  return NextResponse.json({ asset });
}
