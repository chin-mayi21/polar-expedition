import { prisma } from "@/lib/prisma";
import { listInventoryForExpeditions } from "@/lib/inventory/queries";
import { DEVICE_SYNC_STALE_HOURS } from "@/lib/hq/constants";
import { IncidentStatus, MissionStatus } from "@prisma/client";

export type AttentionSignalType =
  | "CHECK_IN_OVERDUE"
  | "RETURN_OVERDUE"
  | "DISCONNECTED"
  | "EMERGENCY";

export type AttentionItem = {
  id: string;
  type: AttentionSignalType;
  title: string;
  detail: string;
  tone: "warning" | "critical";
};

const ACTIVE_MISSION_STATUSES: MissionStatus[] = [
  MissionStatus.ACTIVE,
  MissionStatus.OVERDUE,
  MissionStatus.PLANNED,
];

const OPEN_INCIDENT_STATUSES: IncidentStatus[] = [
  IncidentStatus.NEW,
  IncidentStatus.ACKNOWLEDGED,
  IncidentStatus.INVESTIGATING,
  IncidentStatus.RESPONSE_ACTIVE,
];

export async function fetchAttentionItems(expeditionIds: string[]): Promise<AttentionItem[]> {
  if (expeditionIds.length === 0) return [];

  const now = Date.now();
  const items: AttentionItem[] = [];
  const syncStaleMs = DEVICE_SYNC_STALE_HOURS * 60 * 60 * 1000;

  const missions = await prisma.mission.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      status: { in: ACTIVE_MISSION_STATUSES },
    },
    include: { team: true },
  });

  for (const mission of missions) {
    const intervalMs = mission.checkInIntervalMinutes * 60 * 1000;
    const last = mission.lastCheckInAt?.getTime() ?? mission.plannedDepartAt.getTime();
    const sinceCheckIn = now - last;

    if (sinceCheckIn > intervalMs * 2) {
      items.push({
        id: `checkin-${mission.id}`,
        type: "CHECK_IN_OVERDUE",
        title: `Check-in overdue — ${mission.team.name}`,
        detail: `${mission.code} · interval ${mission.checkInIntervalMinutes}m · last ${mission.lastCheckInAt?.toISOString() ?? "none"}`,
        tone: sinceCheckIn > intervalMs * 3 ? "critical" : "warning",
      });
    }

    if (mission.expectedReturnAt.getTime() < now && mission.status !== MissionStatus.RETURNED) {
      items.push({
        id: `return-${mission.id}`,
        type: "RETURN_OVERDUE",
        title: `Return overdue — ${mission.code}`,
        detail: `Expected ${mission.expectedReturnAt.toISOString()} · team ${mission.team.name}`,
        tone: "critical",
      });
    }
  }

  const fieldPersonnel = await prisma.personnel.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      status: { in: ["ACTIVE", "ON_MISSION"] },
    },
    include: { team: true },
  });

  for (const person of fieldPersonnel) {
    const lastSync = person.lastDeviceSyncAt?.getTime();
    if (!lastSync) continue;
    const stale = now - lastSync > syncStaleMs;
    const onOverdueMission = missions.some(
      (m) =>
        m.status === MissionStatus.OVERDUE &&
        m.teamId === person.teamId &&
        now - lastSync > syncStaleMs
    );
    if (stale && onOverdueMission) {
      items.push({
        id: `sync-${person.id}`,
        type: "DISCONNECTED",
        title: `Device not synced — ${person.fullName}`,
        detail: `${person.team?.name ?? "Unassigned"} · last_sync ${person.lastDeviceSyncAt?.toISOString()} · visibility only`,
        tone: "warning",
      });
    }
  }

  const incidents = await prisma.incident.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      status: { in: OPEN_INCIDENT_STATUSES },
    },
    include: { mission: true },
  });

  for (const inc of incidents) {
    items.push({
      id: `emergency-${inc.id}`,
      type: "EMERGENCY",
      title: `Emergency — ${inc.title}`,
      detail: `${inc.severity} · ${inc.status}${inc.mission ? ` · ${inc.mission.code}` : ""}`,
      tone: inc.severity === "CRITICAL" || inc.severity === "HIGH" ? "critical" : "warning",
    });
  }

  return items;
}

export async function fetchResourceHealth(expeditionIds: string[]) {
  const inventory = await listInventoryForExpeditions(expeditionIds);
  const low = inventory.filter((i) => i.stockLevel === "LOW").length;
  const critical = inventory.filter((i) => i.stockLevel === "CRITICAL").length;

  const assets = await prisma.asset.groupBy({
    by: ["status"],
    where: { expeditionId: { in: expeditionIds } },
    _count: true,
  });

  return {
    inventoryLow: low,
    inventoryCritical: critical,
    assetsMaintenance: assets.find((a) => a.status === "MAINTENANCE")?._count ?? 0,
    assetsOperational: assets.find((a) => a.status === "OPERATIONAL")?._count ?? 0,
  };
}
