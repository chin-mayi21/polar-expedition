import { Prisma } from "@prisma/client";

export type StockLevel = "AVAILABLE" | "LOW" | "CRITICAL";

export function computeOnHand(transactions: { quantity: Prisma.Decimal }[]): Prisma.Decimal {
  return transactions.reduce((sum, t) => sum.add(t.quantity), new Prisma.Decimal(0));
}

export function stockLevel(onHand: Prisma.Decimal, threshold: Prisma.Decimal): StockLevel {
  if (onHand.lte(0)) return "CRITICAL";
  if (onHand.lt(threshold)) return "LOW";
  return "AVAILABLE";
}

export function daysRemaining(onHand: Prisma.Decimal, dailyRate: Prisma.Decimal | null): number | null {
  if (!dailyRate || dailyRate.lte(0)) return null;
  const days = onHand.div(dailyRate).toNumber();
  return Math.max(0, Math.floor(days));
}
