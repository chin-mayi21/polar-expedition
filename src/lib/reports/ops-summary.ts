import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listInventoryForExpeditions } from "@/lib/inventory/queries";
import { explainExpeditionReadiness } from "@/lib/expedition/readiness-explained";

export async function fetchOpsSummary(expeditionIds: string[]) {
  if (expeditionIds.length === 0) {
    return null;
  }

  const primaryId = expeditionIds[0];
  const [expedition, missions, openIncidents, auditCount, inventory] = await Promise.all([
    prisma.expedition.findUnique({ where: { id: primaryId } }),
    prisma.mission.groupBy({
      by: ["status"],
      where: { expeditionId: { in: expeditionIds } },
      _count: true,
    }),
    prisma.incident.count({
      where: {
        expeditionId: { in: expeditionIds },
        status: { in: ["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESPONSE_ACTIVE"] },
      },
    }),
    prisma.auditEvent.count({ where: { expeditionId: { in: expeditionIds } } }),
    listInventoryForExpeditions(expeditionIds),
  ]);

  let readinessPass = true;
  let readinessFailedRules = 0;
  try {
    const readiness = await explainExpeditionReadiness(primaryId);
    readinessPass = readiness.pass;
    readinessFailedRules = readiness.rules.filter((r) => !r.pass).length;
  } catch {
    readinessPass = false;
    readinessFailedRules = 1;
  }

  const missionByStatus = Object.fromEntries(missions.map((m) => [m.status, m._count])) as Record<
    string,
    number
  >;

  return {
    expedition: expedition
      ? { code: expedition.code, name: expedition.name, status: expedition.status }
      : null,
    missions: {
      active: missionByStatus[MissionStatus.ACTIVE] ?? 0,
      overdue: missionByStatus[MissionStatus.OVERDUE] ?? 0,
      planned: missionByStatus[MissionStatus.PLANNED] ?? 0,
      returned: missionByStatus[MissionStatus.RETURNED] ?? 0,
    },
    openIncidents,
    auditEventCount: auditCount,
    inventory: {
      critical: inventory.filter((i) => i.stockLevel === "CRITICAL").length,
      low: inventory.filter((i) => i.stockLevel === "LOW").length,
      skus: inventory.length,
    },
    readinessPass,
    readinessFailedRules,
  };
}
