import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/** Transaction-derived on-hand quantity (never read from a mutable quantity column). */
export async function getInventoryBalance(inventoryItemId: string): Promise<Prisma.Decimal> {
  const agg = await prisma.inventoryTransaction.aggregate({
    where: { inventoryItemId },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? new Prisma.Decimal(0);
}

export async function getBalancesForStation(stationId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { stationId },
    include: {
      transactions: { select: { quantity: true } },
    },
  });

  return items.map((item) => {
    const onHand = item.transactions.reduce(
      (sum, tx) => sum.add(tx.quantity),
      new Prisma.Decimal(0)
    );
    return { ...item, onHand };
  });
}
