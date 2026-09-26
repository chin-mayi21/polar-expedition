import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  teamId: z.string().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const person = await prisma.personnel.findUnique({ where: { id } });
  if (!person || !session.expeditionIds.includes(person.expeditionId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.personnel.update({
    where: { id },
    data: { teamId: parsed.data.teamId },
  });

  return NextResponse.json({ personnel: updated });
}
