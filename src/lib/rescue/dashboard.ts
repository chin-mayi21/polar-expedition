import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Haversine distance km (simulated rescue planning). */
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type RescueMissionRow = {
  id: string;
  code: string;
  title: string;
  status: MissionStatus;
  teamName: string;
  expectedReturnAt: string;
  lastCheckInAt: string | null;
  lastLat: number | null;
  lastLng: number | null;
  nearestStationCode: string | null;
  distanceKm: number | null;
};

export type RescueDashboard = {
  openCriticalIncidents: number;
  overdueMissions: RescueMissionRow[];
  activeEmergencies: {
    id: string;
    title: string;
    severity: string;
    status: string;
    missionCode: string | null;
    lat: number | null;
    lng: number | null;
  }[];
  rescueAssets: { assetTag: string; name: string; stationCode: string; status: string }[];
  checklist: { id: string; label: string; done: boolean }[];
};

export async function fetchRescueDashboard(expeditionIds: string[]): Promise<RescueDashboard | null> {
  if (expeditionIds.length === 0) return null;

  const stations = await prisma.station.findMany({
    where: { expeditionId: { in: expeditionIds } },
  });

  const overdue = await prisma.mission.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      status: { in: [MissionStatus.OVERDUE, MissionStatus.ACTIVE] },
    },
    include: {
      team: true,
      checkIns: {
        where: { simulatedLatitude: { not: null } },
        orderBy: { checkedInAt: "desc" },
        take: 1,
      },
    },
    orderBy: { expectedReturnAt: "asc" },
  });

  const emergencies = await prisma.incident.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      status: { in: ["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESPONSE_ACTIVE"] },
      severity: { in: ["HIGH", "CRITICAL"] },
    },
    include: { mission: true },
    orderBy: { createdAt: "desc" },
  });

  const assets = await prisma.asset.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      category: { in: ["Vehicle", "Comms"] },
      status: "OPERATIONAL",
    },
    include: { station: true },
    take: 8,
  });

  const missionRows: RescueMissionRow[] = overdue
    .filter((m) => m.status === MissionStatus.OVERDUE || m.checkIns.length > 0)
    .map((m) => {
      const last = m.checkIns[0];
      let nearestCode: string | null = null;
      let dist: number | null = null;
      if (last?.simulatedLatitude != null && last.simulatedLongitude != null) {
        for (const st of stations) {
          if (st.latitude == null || st.longitude == null) continue;
          const d = distanceKm(
            last.simulatedLatitude,
            last.simulatedLongitude,
            st.latitude,
            st.longitude
          );
          if (dist == null || d < dist) {
            dist = d;
            nearestCode = st.code;
          }
        }
      }
      return {
        id: m.id,
        code: m.code,
        title: m.title,
        status: m.status,
        teamName: m.team.name,
        expectedReturnAt: m.expectedReturnAt.toISOString(),
        lastCheckInAt: m.lastCheckInAt?.toISOString() ?? null,
        lastLat: last?.simulatedLatitude ?? null,
        lastLng: last?.simulatedLongitude ?? null,
        nearestStationCode: nearestCode,
        distanceKm: dist != null ? Math.round(dist) : null,
      };
    });

  const checklist = [
    {
      id: "ack",
      label: "ECC incident acknowledged and status line updated",
      done: emergencies.some((e) => e.status !== "NEW"),
    },
    {
      id: "pos",
      label: "Last confirmed position plotted on simulated map",
      done: missionRows.some((m) => m.lastLat != null),
    },
    {
      id: "asset",
      label: "Operational rescue asset identified at station",
      done: assets.length > 0,
    },
    {
      id: "comms",
      label: "Comms window scheduled with field team",
      done: false,
    },
  ];

  return {
    openCriticalIncidents: emergencies.filter((e) => e.severity === "CRITICAL").length,
    overdueMissions: missionRows.filter((m) => m.status === MissionStatus.OVERDUE),
    activeEmergencies: emergencies.map((e) => ({
      id: e.id,
      title: e.title,
      severity: e.severity,
      status: e.status,
      missionCode: e.mission?.code ?? null,
      lat: e.lastConfirmedLat,
      lng: e.lastConfirmedLng,
    })),
    rescueAssets: assets.map((a) => ({
      assetTag: a.assetTag,
      name: a.name,
      stationCode: a.station?.code ?? "—",
      status: a.status,
    })),
    checklist,
  };
}
