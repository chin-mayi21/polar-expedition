import { IncidentSeverity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const severityRank: Record<IncidentSeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export async function listIncidentsForExpeditions(expeditionIds: string[]) {
  if (expeditionIds.length === 0) return [];

  const rows = await prisma.incident.findMany({
    where: { expeditionId: { in: expeditionIds } },
    include: {
      mission: {
        include: {
          team: true,
          personnel: { include: { personnel: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.sort(
    (a, b) =>
      severityRank[b.severity] - severityRank[a.severity] ||
      b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getIncidentForScope(incidentId: string, expeditionIds: string[]) {
  return prisma.incident.findFirst({
    where: { id: incidentId, expeditionId: { in: expeditionIds } },
    include: {
      mission: {
        include: {
          team: true,
          personnel: { include: { personnel: true } },
        },
      },
      expedition: { select: { code: true, name: true } },
    },
  });
}
