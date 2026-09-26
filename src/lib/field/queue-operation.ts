"use client";

import { enqueueFieldOperation, listQueuedOperations } from "@/lib/field/offline-db";
import type { FieldOperationType } from "@/lib/field/operations";
import { flushFieldQueue } from "@/lib/field/sync-client";
import { useFieldConnectivity } from "@/stores/field-connectivity";

export async function queueFieldOperation(
  operationType: FieldOperationType,
  payload: Record<string, unknown>,
  options?: { skipFlush?: boolean }
) {
  const row = await enqueueFieldOperation(operationType, payload);
  const pending = await listQueuedOperations();
  useFieldConnectivity.getState().setPendingCount(pending.length);

  const online = useFieldConnectivity.getState().isEffectivelyOnline();
  if (!options?.skipFlush && online) {
    await flushFieldQueue();
    const after = await listQueuedOperations();
    useFieldConnectivity.getState().setPendingCount(after.length);
  }

  return row;
}
