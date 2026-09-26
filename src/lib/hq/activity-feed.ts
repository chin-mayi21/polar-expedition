import { prisma } from "@/lib/prisma";

export type FeedItem = {
  id: string;
  at: Date;
  text: string;
  tag?: string;
};

export async function fetchActivityFeed(expeditionIds: string[], limit = 12): Promise<FeedItem[]> {
  if (expeditionIds.length === 0) return [];

  const [checkIns, cargoEvents, audits, txns] = await Promise.all([
    prisma.checkIn.findMany({
      where: { mission: { expeditionId: { in: expeditionIds } } },
      orderBy: { checkedInAt: "desc" },
      take: limit,
      include: { personnel: true, mission: { include: { team: true } } },
    }),
    prisma.cargoEvent.findMany({
      where: { cargoItem: { expeditionId: { in: expeditionIds } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { cargoItem: true },
    }),
    prisma.auditEvent.findMany({
      where: { expeditionId: { in: expeditionIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.inventoryTransaction.findMany({
      where: { inventoryItem: { expeditionId: { in: expeditionIds } } },
      orderBy: { occurredAt: "desc" },
      take: limit,
      include: { inventoryItem: true },
    }),
  ]);

  const items: FeedItem[] = [];

  for (const c of checkIns) {
    items.push({
      id: `ci-${c.id}`,
      at: c.checkedInAt,
      text: `${c.mission.team.name} checked in — ${c.personnel.fullName} (${c.status.replace("_", " ").toLowerCase()})`,
      tag: "Check-in",
    });
  }

  for (const e of cargoEvents) {
    const status = e.toStatus ?? e.cargoItem.status;
    items.push({
      id: `cg-${e.id}`,
      at: e.createdAt,
      text: `Cargo ${e.cargoItem.manifestCode} → ${status}${e.note ? ` — ${e.note}` : ""}`,
      tag: "Cargo",
    });
  }

  for (const t of txns) {
    items.push({
      id: `inv-${t.id}`,
      at: t.occurredAt,
      text: `Inventory ${t.inventoryItem.sku}: ${t.type} ${t.quantity.toString()} ${t.inventoryItem.unit}`,
      tag: "Inventory",
    });
  }

  for (const a of audits) {
    if (a.action === "LOGIN") continue;
    items.push({
      id: `aud-${a.id}`,
      at: a.createdAt,
      text: `${a.entityType} ${a.action.toLowerCase().replace("_", " ")}`,
      tag: "Audit",
    });
  }

  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
