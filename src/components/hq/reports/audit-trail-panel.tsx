"use client";

import { useMemo, useState } from "react";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type AuditTrailRow = {
  id: string;
  createdAt: string;
  reproducibilityKey: string;
  actorEmail: string | null;
  actorName: string | null;
  entityType: string;
  entityId: string;
  action: string;
  previousState: unknown;
  newState: unknown;
  metadata: unknown;
};

function JsonBlock({ value }: { value: unknown }) {
  if (value == null) return <span className="text-text-secondary">—</span>;
  return (
    <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] text-text-primary">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function AuditTrailPanel({ rows }: { rows: AuditTrailRow[] }) {
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(rows[0]?.id ?? null);

  const entityTypes = useMemo(
    () => [...new Set(rows.map((r) => r.entityType))].sort(),
    [rows]
  );
  const actions = useMemo(() => [...new Set(rows.map((r) => r.action))].sort(), [rows]);

  const filtered = rows.filter((r) => {
    if (entityFilter && r.entityType !== entityFilter) return false;
    if (actionFilter && r.action !== actionFilter) return false;
    return true;
  });

  async function downloadExport() {
    try {
      const res = await fetch("/api/hq/audit/export");
      if (!res.ok) {
        toast.error("Export failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cryolink-audit-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit packet downloaded.");
    } catch {
      toast.error("Export failed.");
    }
  }

  return (
    <section
      id="audit-trail"
      className="border border-border bg-surface rounded-[2px]"
      aria-labelledby="audit-trail-heading"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 id="audit-trail-heading" className="font-display text-lg font-semibold text-text-primary">
            Audit trail — reproducible packets
          </h2>
          <p className="mt-1 text-xs text-text-secondary">
            Each row includes previous/new state JSON for judge replay. Hash-chain fields are a future phase.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" className="gap-2" onClick={downloadExport}>
          <Download className="h-4 w-4" aria-hidden />
          Export JSON
        </Button>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
        <select
          className="h-9 border border-border bg-bg px-2 text-xs rounded-[2px]"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="">All entity types</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="h-9 border border-border bg-bg px-2 text-xs rounded-[2px]"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <ul className="max-h-[520px] divide-y divide-border overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="p-6 text-center text-sm text-text-secondary">No audit events match filters.</li>
        ) : (
          filtered.map((row) => {
            const open = expanded === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-bg"
                  onClick={() => setExpanded(open ? null : row.id)}
                >
                  {open ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                  ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] text-text-secondary">{row.createdAt.replace("T", " ").slice(0, 19)}Z</p>
                    <p className="text-sm font-medium text-text-primary">
                      {row.entityType} · {row.action.replace("_", " ")}
                    </p>
                    <p className="font-mono text-[10px] text-cyan truncate">{row.reproducibilityKey}</p>
                    <p className="text-xs text-text-secondary">
                      {row.actorName ?? row.actorEmail ?? "System"} · entity {row.entityId.slice(0, 12)}…
                    </p>
                  </div>
                </button>
                {open ? (
                  <div className="grid gap-3 border-t border-border bg-bg px-4 py-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium text-text-secondary">Previous state</p>
                      <JsonBlock value={row.previousState} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-secondary">New state</p>
                      <JsonBlock value={row.newState} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-secondary">Metadata</p>
                      <JsonBlock value={row.metadata} />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
