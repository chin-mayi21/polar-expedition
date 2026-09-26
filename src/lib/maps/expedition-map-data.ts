import { prisma } from "@/lib/prisma";

export type MapMarker = {
  id: string;
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
  kind: "station" | "checkin" | "incident";
  at?: string;
};

export async function fetchExpeditionMapMarkers(expeditionIds: string[]): Promise<{
  markers: MapMarker[];
  center: [number, number];
}> {
  if (expeditionIds.length === 0) {
    return { markers: [], center: [12, -70] };
  }

  const [stations, checkIns, incidents] = await Promise.all([
    prisma.station.findMany({
      where: { expeditionId: { in: expeditionIds } },
    }),
    prisma.checkIn.findMany({
      where: {
        mission: { expeditionId: { in: expeditionIds } },
        simulatedLatitude: { not: null },
        simulatedLongitude: { not: null },
      },
      orderBy: { checkedInAt: "desc" },
      take: 24,
      include: { personnel: true, mission: { include: { team: true } } },
    }),
    prisma.incident.findMany({
      where: {
        expeditionId: { in: expeditionIds },
        lastConfirmedLat: { not: null },
        lastConfirmedLng: { not: null },
        status: { in: ["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESPONSE_ACTIVE"] },
      },
      take: 10,
    }),
  ]);

  const markers: MapMarker[] = [];

  for (const st of stations) {
    if (st.latitude == null || st.longitude == null) continue;
    markers.push({
      id: `station-${st.id}`,
      lng: st.longitude,
      lat: st.latitude,
      title: st.name,
      subtitle: `Station ${st.code}`,
      kind: "station",
    });
  }

  const seenMission = new Set<string>();
  for (const c of checkIns) {
    if (seenMission.has(c.missionId)) continue;
    seenMission.add(c.missionId);
    markers.push({
      id: `checkin-${c.id}`,
      lng: c.simulatedLongitude!,
      lat: c.simulatedLatitude!,
      title: c.mission.team.name,
      subtitle: `${c.mission.code} · ${c.personnel.fullName}`,
      kind: "checkin",
      at: c.checkedInAt.toISOString(),
    });
  }

  for (const inc of incidents) {
    markers.push({
      id: `incident-${inc.id}`,
      lng: inc.lastConfirmedLng!,
      lat: inc.lastConfirmedLat!,
      title: inc.title,
      subtitle: `${inc.severity} · ${inc.status}`,
      kind: "incident",
      at: inc.lastConfirmedAt?.toISOString(),
    });
  }

  const centerLng =
    markers.length > 0
      ? markers.reduce((s, m) => s + m.lng, 0) / markers.length
      : 12;
  const centerLat =
    markers.length > 0
      ? markers.reduce((s, m) => s + m.lat, 0) / markers.length
      : -70;

  return { markers, center: [centerLng, centerLat] };
}
