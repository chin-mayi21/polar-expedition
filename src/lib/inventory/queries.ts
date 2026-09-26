import { prisma } from "@/lib/prisma";
import { computeOnHand, daysRemaining, stockLevel } from "@/lib/inventory/stock-status";
import { Prisma } from "@prisma/client";

export async function listInventoryForExpeditions(expeditionIds: string[]) {
  if (expeditionIds.length === 0) return [];

  const items = await prisma.inventoryItem.findMany({
    where: { expeditionId: { in: expeditionIds } },
    include: {
      station: { select: { code: true, name: true } },
      transactions: { select: { quantity: true } },
    },
    orderBy: [{ station: { code: "asc" } }, { sku: "asc" }],
  });

  return items.map((item) => {
    const onHand = computeOnHand(item.transactions);
    const level = stockLevel(onHand, item.lowStockThreshold);
    const days = daysRemaining(onHand, item.dailyConsumptionRate);
    return {
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      unit: item.unit,
      stationCode: item.station.code,
      stationName: item.station.name,
      lowStockThreshold: item.lowStockThreshold.toString(),
      dailyConsumptionRate: item.dailyConsumptionRate?.toString() ?? null,
      onHand: onHand.toString(),
      stockLevel: level,
      daysRemaining: days,
    };
  });
}

export async function getInventoryDetail(inventoryItemId: string, expeditionIds: string[]) {
  const item = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, expeditionId: { in: expeditionIds } },
    include: {
      station: true,
      transactions: {
        orderBy: { occurredAt: "desc" },
        take: 50,
        include: { actor: { select: { name: true, email: true } } },
      },
    },
  });
  if (!item) return null;

  const onHand = computeOnHand(item.transactions);
  return {
    ...item,
    onHand: onHand.toString(),
    stockLevel: stockLevel(onHand, item.lowStockThreshold),
    daysRemaining: daysRemaining(onHand, item.dailyConsumptionRate),
  };
}

export function signedQuantity(type: string, quantity: number): Prisma.Decimal {
  const q = new Prisma.Decimal(quantity);
  if (type === "RECEIPT") return q;
  if (type === "CONSUMPTION" || type === "LOSS") return q.neg();
  return q;
}
