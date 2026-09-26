import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth/types";

export async function buildSessionUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { expeditionScopes: true },
  });
  if (!user) return null;

  let expeditionIds = user.expeditionScopes.map((s) => s.expeditionId);

  if (user.role === "FIELD_PERSONNEL" && user.personnelId) {
    const personnel = await prisma.personnel.findUnique({
      where: { id: user.personnelId },
      select: { expeditionId: true },
    });
    if (personnel) expeditionIds = [personnel.expeditionId];
  }

  if (user.role === "FAMILY_NOK" && user.nextOfKinForId) {
    const personnel = await prisma.personnel.findUnique({
      where: { id: user.nextOfKinForId },
      select: { expeditionId: true },
    });
    if (personnel) expeditionIds = [personnel.expeditionId];
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    personnelId: user.personnelId,
    nextOfKinForId: user.nextOfKinForId,
    expeditionIds,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return buildSessionUser(session.user.id);
}
