import type { FieldOperationType } from "@/lib/field/operations";

const DB_NAME = "polar-nexus-field";
const DB_VERSION = 1;
const STORE = "queue";

export type QueuedFieldOperation = {
  clientOperationId: string;
  operationType: FieldOperationType;
  payload: Record<string, unknown>;
  clientCreatedAt: string;
  attempts: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "clientOperationId" });
      }
    };
  });
}

export async function listQueuedOperations(): Promise<QueuedFieldOperation[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const rows = (req.result as QueuedFieldOperation[]).sort(
        (a, b) => a.clientCreatedAt.localeCompare(b.clientCreatedAt)
      );
      resolve(rows);
    };
  });
}

export async function enqueueFieldOperation(
  operationType: FieldOperationType,
  payload: Record<string, unknown>
): Promise<QueuedFieldOperation> {
  const row: QueuedFieldOperation = {
    clientOperationId: crypto.randomUUID(),
    operationType,
    payload,
    clientCreatedAt: new Date().toISOString(),
    attempts: 0,
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(row);
  });
  return row;
}

export async function removeQueuedOperation(clientOperationId: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).delete(clientOperationId);
  });
}

export async function bumpQueueAttempt(clientOperationId: string) {
  const db = await openDb();
  const rows = await listQueuedOperations();
  const row = rows.find((r) => r.clientOperationId === clientOperationId);
  if (!row) return;
  row.attempts += 1;
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(row);
  });
}
