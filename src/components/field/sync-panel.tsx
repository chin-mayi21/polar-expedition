"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { flushFieldQueue } from "@/lib/field/sync-client";
import { listQueuedOperations } from "@/lib/field/offline-db";
import { useFieldConnectivity } from "@/stores/field-connectivity";

export function SyncPanel() {
  const router = useRouter();
  const forceOffline = useFieldConnectivity((s) => s.forceOffline);
  const setForceOffline = useFieldConnectivity((s) => s.setForceOffline);
  const pendingCount = useFieldConnectivity((s) => s.pendingCount);
  const setPendingCount = useFieldConnectivity((s) => s.setPendingCount);
  const online = useFieldConnectivity((s) => s.isEffectivelyOnline());
  const [busy, setBusy] = useState(false);
  const [queuePreview, setQueuePreview] = useState<string[]>([]);

  useEffect(() => {
    refreshQueue();
  }, []);

  async function refreshQueue() {
    const rows = await listQueuedOperations();
    setPendingCount(rows.length);
    setQueuePreview(rows.map((r) => `${r.operationType} · ${r.clientCreatedAt.slice(11, 19)}`));
  }

  async function syncNow() {
    setBusy(true);
    try {
      const result = await flushFieldQueue();
      await refreshQueue();
      router.refresh();
      if (result.synced.length) toast.success(`Synced ${result.synced.length} operation(s).`);
      if (result.failed.length) toast.error(`${result.failed.length} failed — still in queue.`);
      if (!result.synced.length && !result.failed.length) toast.message("Queue empty.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border border-border bg-surface p-4 rounded-[2px]">
        {online ? (
          <Cloud className="h-6 w-6 text-cyan" aria-hidden />
        ) : (
          <CloudOff className="h-6 w-6 text-amber" aria-hidden />
        )}
        <div>
          <p className="font-medium">{online ? "Online" : "Offline (demo or network)"}</p>
          <p className="text-sm text-text-secondary">
            Pending sync ({pendingCount}) — idempotent via client operation IDs
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between border border-border bg-bg px-4 py-3 text-sm rounded-[2px]">
        <span>Simulate offline (demo)</span>
        <input
          type="checkbox"
          checked={forceOffline}
          onChange={(e) => setForceOffline(e.target.checked)}
          className="h-4 w-4 accent-navy"
        />
      </label>

      <Button variant="navy" size="field" className="gap-2" disabled={busy || !online} onClick={syncNow}>
        <RefreshCw className="h-5 w-5" aria-hidden />
        Sync now
      </Button>

      <Button variant="secondary" size="sm" onClick={refreshQueue}>
        Refresh queue list
      </Button>

      {queuePreview.length > 0 ? (
        <ul className="space-y-1 font-mono text-[10px] text-text-secondary">
          {queuePreview.map((line, i) => (
            <li key={i} className="border border-border px-2 py-1 rounded-[2px]">{line}</li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-text-secondary">
        Status uses icon + text, not color alone. Operations replay into <span className="font-mono">SyncOperation</span> on the server.
      </p>
    </div>
  );
}
