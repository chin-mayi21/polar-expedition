"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/design/status-badge";
import {
  canPerformIncidentAction,
  type IncidentAction,
} from "@/lib/emergency/incident-actions";
import type { IncidentSeverity, IncidentStatus } from "@prisma/client";

export type EccIncidentRow = {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary: string | null;
  currentStatusSummary: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  lastConfirmedAt: string | null;
  lastConfirmedLat: number | null;
  lastConfirmedLng: number | null;
  missionCode: string | null;
  teamName: string | null;
  crewNames: string[];
};

function severityTone(severity: string) {
  if (severity === "CRITICAL") return "critical" as const;
  if (severity === "HIGH") return "warning" as const;
  return "neutral" as const;
}

const ACTION_LABELS: Record<IncidentAction, string> = {
  acknowledge: "Acknowledge",
  start_investigation: "Start investigation",
  activate_response: "Activate response",
  resolve: "Mark resolved",
  close: "Close incident",
};

export function EccIncidentBoard({ incidents }: { incidents: EccIncidentRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(incidents[0]?.id ?? "");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

  const item = incidents.find((i) => i.id === selected);

  async function act(action: IncidentAction) {
    if (!item) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/hq/incidents/${item.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, statusSummary: summary || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Action failed.");
        return;
      }
      toast.success(ACTION_LABELS[action]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (incidents.length === 0) {
    return (
      <p className="border border-dashed border-border p-8 text-center text-sm text-text-secondary">
        No incidents in expedition scope.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <ul className="max-h-[560px] space-y-1 overflow-y-auto border border-border bg-surface p-2 rounded-[2px]">
        {incidents.map((inc) => (
          <li key={inc.id}>
            <button
              type="button"
              onClick={() => setSelected(inc.id)}
              className={`w-full border px-3 py-2 text-left rounded-[2px] ${
                selected === inc.id ? "border-cyan bg-bg" : "border-transparent hover:bg-bg"
              }`}
            >
              <StatusBadge label={inc.severity} tone={severityTone(inc.severity)} />
              <p className="mt-1 text-sm font-medium line-clamp-2">{inc.title}</p>
              <p className="font-mono text-[10px] text-text-secondary">{inc.status}</p>
            </button>
          </li>
        ))}
      </ul>

      {item ? (
        <article className="border border-border bg-surface p-4 rounded-[2px]">
          <header className="border-b border-border pb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">{item.title}</h2>
              <StatusBadge label={item.status} tone={severityTone(item.severity)} />
            </div>
            {item.missionCode ? (
              <p className="mt-2 font-mono text-xs text-cyan">
                {item.missionCode} · {item.teamName ?? "Team"}
              </p>
            ) : null}
          </header>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-text-secondary">Summary</p>
              <p className="mt-1 text-text-primary">{item.summary ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary">HQ status line</p>
              <p className="mt-1 text-text-primary">{item.currentStatusSummary ?? "—"}</p>
            </div>
          </div>

          <div className="mt-4 border border-border bg-bg p-3 rounded-[2px]">
            <p className="text-xs font-medium text-text-secondary">Emergency packet — last confirmed position</p>
            <p className="mt-1 font-mono text-[10px] text-amber">Simulated coordinates</p>
            <p className="mt-2 font-mono text-xs text-text-primary">
              {item.lastConfirmedLat != null && item.lastConfirmedLng != null
                ? `${item.lastConfirmedLat.toFixed(4)}, ${item.lastConfirmedLng.toFixed(4)}`
                : "No position on file"}
            </p>
            <p className="mt-1 font-mono text-[10px] text-text-secondary">
              Confirmed {item.lastConfirmedAt?.slice(0, 19) ?? "—"}Z
            </p>
            {item.crewNames.length > 0 ? (
              <p className="mt-2 text-xs text-text-secondary">Crew: {item.crewNames.join(", ")}</p>
            ) : null}
          </div>

          <div className="mt-4 font-mono text-[10px] text-text-secondary">
            Opened {item.createdAt.slice(0, 19)}Z
            {item.acknowledgedAt ? ` · Ack ${item.acknowledgedAt.slice(0, 19)}Z` : ""}
            {item.resolvedAt ? ` · Resolved ${item.resolvedAt.slice(0, 19)}Z` : ""}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-4">
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Update HQ status line (optional)"
            />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  "acknowledge",
                  "start_investigation",
                  "activate_response",
                  "resolve",
                  "close",
                ] as IncidentAction[]
              ).map((action) =>
                canPerformIncidentAction(item.status, action) ? (
                  <Button
                    key={action}
                    size="sm"
                    variant={action === "close" ? "secondary" : action === "resolve" ? "navy" : "secondary"}
                    disabled={busy}
                    onClick={() => act(action)}
                  >
                    {ACTION_LABELS[action]}
                  </Button>
                ) : null
              )}
            </div>
          </div>
        </article>
      ) : null}
    </div>
  );
}
