"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/design/status-badge";
import { canPerformAction } from "@/lib/missions/actions";
import type { MissionStatus } from "@prisma/client";

export type MissionRow = {
  id: string;
  code: string;
  title: string;
  status: string;
  teamName: string;
  expectedReturnAt: string;
  checkInIntervalMinutes: number;
  checkInCount: number;
  crew: string[];
};

const STAGES = ["PLANNED", "ACTIVE", "OVERDUE", "RETURNED", "CANCELLED"] as const;

function toneForStatus(status: string) {
  if (status === "ACTIVE") return "accent" as const;
  if (status === "OVERDUE") return "warning" as const;
  if (status === "RETURNED") return "success" as const;
  if (status === "CANCELLED") return "critical" as const;
  return "neutral" as const;
}

export function MissionsBoard({ missions }: { missions: MissionRow[] }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function act(missionId: string, action: "activate" | "mark_delayed" | "mark_returned" | "cancel") {
    setBusy(missionId);
    try {
      const res = await fetch(`/api/hq/missions/${missionId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action failed.");
        return;
      }
      toast.success(`Mission updated: ${action.replace("_", " ")}`);
      setReason("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (missions.length === 0) {
    return <p className="text-sm text-text-secondary">No missions in scope.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border border-border bg-bg px-3 py-2 text-xs rounded-[2px]">
        {STAGES.map((s) => (
          <span key={s} className="font-mono text-text-secondary">{s}</span>
        ))}
      </div>
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required for delay / cancel)"
        className="max-w-md"
      />
      <div className="space-y-3">
        {missions.map((m) => (
          <article key={m.id} className="border border-border bg-surface p-4 rounded-[2px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-cyan">{m.code}</p>
                <h3 className="font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  {m.teamName} · return {new Date(m.expectedReturnAt).toISOString().slice(0, 16)}Z · check-in every{" "}
                  {m.checkInIntervalMinutes}m
                </p>
                <p className="mt-1 font-mono text-[10px] text-text-secondary">
                  Crew: {m.crew.join(", ") || "—"} · {m.checkInCount} check-ins logged
                </p>
              </div>
              <StatusBadge label={m.status} tone={toneForStatus(m.status)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {canPerformAction(m.status as MissionStatus, "activate") && (
                <Button size="sm" variant="navy" disabled={busy === m.id} onClick={() => act(m.id, "activate")}>
                  Start mission
                </Button>
              )}
              {canPerformAction(m.status as MissionStatus, "mark_delayed") && (
                <Button size="sm" variant="secondary" disabled={busy === m.id} onClick={() => act(m.id, "mark_delayed")}>
                  Mark delayed
                </Button>
              )}
              {canPerformAction(m.status as MissionStatus, "mark_returned") && (
                <Button size="sm" variant="secondary" disabled={busy === m.id} onClick={() => act(m.id, "mark_returned")}>
                  Mark returned
                </Button>
              )}
              {canPerformAction(m.status as MissionStatus, "cancel") && (
                <Button size="sm" variant="destructive" disabled={busy === m.id} onClick={() => act(m.id, "cancel")}>
                  Cancel mission
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
