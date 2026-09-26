import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const items = await prisma.cargoItem.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: {
      originStation: true,
      destinationStation: true,
      events: { orderBy: { createdAt: "desc" }, take: 5, include: { actor: { select: { name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ items });
}
