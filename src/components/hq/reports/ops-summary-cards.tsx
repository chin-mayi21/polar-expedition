import type { fetchOpsSummary } from "@/lib/reports/ops-summary";

type Summary = NonNullable<Awaited<ReturnType<typeof fetchOpsSummary>>>;

export function OpsSummaryCards({ summary }: { summary: Summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="border border-border bg-surface p-4 rounded-[2px]">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Expedition</p>
        <p className="mt-2 font-display text-lg font-semibold">{summary.expedition?.name ?? "—"}</p>
        <p className="font-mono text-xs text-cyan">{summary.expedition?.code} · {summary.expedition?.status}</p>
      </div>
      <div className="border border-border bg-surface p-4 rounded-[2px]">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Missions</p>
        <p className="mt-2 font-mono text-sm text-text-primary">
          {summary.missions.active} active · {summary.missions.overdue} overdue
        </p>
        <p className="font-mono text-[10px] text-text-secondary">
          {summary.missions.planned} planned · {summary.missions.returned} returned
        </p>
      </div>
      <div className="border border-border bg-surface p-4 rounded-[2px]">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Supply health</p>
        <p className="mt-2 font-mono text-sm text-text-primary">
          {summary.inventory.critical} critical · {summary.inventory.low} low
        </p>
        <p className="font-mono text-[10px] text-text-secondary">{summary.inventory.skus} SKUs tracked</p>
      </div>
      <div className="border border-border bg-surface p-4 rounded-[2px]">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Audit & readiness</p>
        <p className="mt-2 font-mono text-sm text-text-primary">{summary.auditEventCount} audit events</p>
        <p className="font-mono text-[10px] text-text-secondary">
          {summary.openIncidents} open incidents · readiness{" "}
          {summary.readinessPass ? "pass" : `${summary.readinessFailedRules} rule(s) fail`}
        </p>
      </div>
    </div>
  );
}
