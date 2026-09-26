"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listQueuedOperations } from "@/lib/field/offline-db";
import { flushFieldQueue } from "@/lib/field/sync-client";
import { useFieldConnectivity } from "@/stores/field-connectivity";

export function FieldSyncProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setPendingCount = useFieldConnectivity((s) => s.setPendingCount);
  const forceOffline = useFieldConnectivity((s) => s.forceOffline);

  const refreshPending = useCallback(async () => {
    const pending = await listQueuedOperations();
    setPendingCount(pending.length);
  }, [setPendingCount]);

  const tryFlush = useCallback(async () => {
    if (useFieldConnectivity.getState().isEffectivelyOnline()) {
      await flushFieldQueue();
      await refreshPending();
      router.refresh();
    }
  }, [refreshPending, router]);

  useEffect(() => {
    refreshPending();
    tryFlush();

    const onOnline = () => tryFlush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [forceOffline, refreshPending, tryFlush]);

  return children;
}
