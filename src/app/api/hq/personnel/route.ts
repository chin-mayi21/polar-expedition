import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const personnel = await prisma.personnel.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: { team: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ personnel });
}
