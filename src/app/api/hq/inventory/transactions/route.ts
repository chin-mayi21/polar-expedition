import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import { inventoryTransactionSchema } from "@/lib/inventory/schemas";
import { signedQuantity } from "@/lib/inventory/queries";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const json = await request.json().catch(() => null);
  const parsed = inventoryTransactionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { inventoryItemId, type, quantity, reference, note } = parsed.data;

  const item = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, expeditionId: { in: session.expeditionIds } },
  });
  if (!item) {
    return NextResponse.json({ error: "Inventory item not found in your expedition scope." }, { status: 404 });
  }

  const signed = signedQuantity(type, quantity);

  const txn = await prisma.$transaction(async (tx) => {
    const created = await tx.inventoryTransaction.create({
      data: {
        inventoryItemId,
        type,
        quantity: signed,
        reference: reference || null,
        note: note || null,
        actorUserId: session.id,
      },
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: session.id,
        expeditionId: item.expeditionId,
        entityType: "InventoryTransaction",
        entityId: created.id,
        action: "CREATE",
        newState: JSON.stringify({ type, quantity: signed.toString(), sku: item.sku }),
      },
    });
    return created;
  });

  return NextResponse.json({ ok: true, transactionId: txn.id });
}
