import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ isComplete: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { itemId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const item = await prisma.expeditionReadinessItem.findUnique({
    where: { id: itemId },
    include: { expedition: true },
  });
  if (!item || !session.expeditionIds.includes(item.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.expeditionReadinessItem.update({
    where: { id: itemId },
    data: {
      isComplete: parsed.data.isComplete,
      completedAt: parsed.data.isComplete ? new Date() : null,
      completedById: parsed.data.isComplete ? session.id : null,
    },
  });

  return NextResponse.json({ item: updated });
}
