"use client";

import {
  bumpQueueAttempt,
  listQueuedOperations,
  removeQueuedOperation,
} from "@/lib/field/offline-db";

export type SyncResult = {
  synced: string[];
  failed: { clientOperationId: string; error: string }[];
  duplicates: string[];
};

export async function flushFieldQueue(): Promise<SyncResult> {
  const pending = await listQueuedOperations();
  const result: SyncResult = { synced: [], failed: [], duplicates: [] };
  if (pending.length === 0) return result;

  const res = await fetch("/api/field/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operations: pending.map((op) => ({
        clientOperationId: op.clientOperationId,
        operationType: op.operationType,
        payload: op.payload,
        clientCreatedAt: op.clientCreatedAt,
      })),
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    for (const op of pending) {
      await bumpQueueAttempt(op.clientOperationId);
      result.failed.push({
        clientOperationId: op.clientOperationId,
        error: json.error ?? `HTTP ${res.status}`,
      });
    }
    return result;
  }

  const outcomes = (json.results ?? []) as {
    clientOperationId: string;
    status: "applied" | "duplicate" | "failed";
    error?: string;
  }[];

  for (const outcome of outcomes) {
    if (outcome.status === "failed") {
      await bumpQueueAttempt(outcome.clientOperationId);
      result.failed.push({
        clientOperationId: outcome.clientOperationId,
        error: outcome.error ?? "Failed",
      });
    } else {
      await removeQueuedOperation(outcome.clientOperationId);
      if (outcome.status === "duplicate") result.duplicates.push(outcome.clientOperationId);
      else result.synced.push(outcome.clientOperationId);
    }
  }

  return result;
}
