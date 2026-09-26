import Link from "next/link";
import { StatusBadge } from "@/components/design/status-badge";
import type { RescueDashboard } from "@/lib/rescue/dashboard";
import { CheckCircle2, Circle } from "lucide-react";

export function RescueDashboardView({ data }: { data: RescueDashboard }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-surface p-4 rounded-[2px]">
          <p className="text-xs text-text-secondary">Critical incidents</p>
          <p className="mt-2 font-display text-2xl font-semibold">{data.openCriticalIncidents}</p>
        </div>
        <div className="border border-border bg-surface p-4 rounded-[2px]">
          <p className="text-xs text-text-secondary">Overdue missions</p>
          <p className="mt-2 font-display text-2xl font-semibold">{data.overdueMissions.length}</p>
        </div>
        <div className="border border-border bg-surface p-4 rounded-[2px]">
          <p className="text-xs text-text-secondary">Rescue assets (ops)</p>
          <p className="mt-2 font-display text-2xl font-semibold">{data.rescueAssets.length}</p>
        </div>
      </div>

      <section className="border border-border bg-surface rounded-[2px]">
        <header className="border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-semibold">Overdue / extraction candidates</h2>
          <p className="text-xs text-text-secondary">Simulated great-circle distance to nearest station</p>
        </header>
        <ul className="divide-y divide-border">
          {data.overdueMissions.length === 0 ? (
            <li className="px-4 py-6 text-sm text-text-secondary">No overdue missions in scope.</li>
          ) : (
            data.overdueMissions.map((m) => (
              <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-mono text-xs text-cyan">{m.code}</p>
                  <p className="font-medium">{m.title}</p>
                  <p className="text-xs text-text-secondary">{m.teamName}</p>
                  {m.lastLat != null ? (
                    <p className="mt-1 font-mono text-[10px] text-amber">
                      Last confirmed (sim): {m.lastLat.toFixed(2)}, {m.lastLng?.toFixed(2)}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <StatusBadge label={m.status} tone="warning" />
                  {m.distanceKm != null ? (
                    <p className="mt-2 font-mono text-xs text-text-primary">
                      ~{m.distanceKm} km to {m.nearestStationCode}
                    </p>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="border border-border bg-surface rounded-[2px]">
        <header className="border-b border-border px-4 py-3">
          <h2 className="font-display text-lg font-semibold">Active emergencies</h2>
        </header>
        <ul className="divide-y divide-border">
          {data.activeEmergencies.map((e) => (
            <li key={e.id} className="px-4 py-3 text-sm">
              <StatusBadge
                label={e.severity}
                tone={e.severity === "CRITICAL" ? "critical" : "warning"}
              />
              <p className="mt-1 font-medium">{e.title}</p>
              <p className="font-mono text-[10px] text-text-secondary">
                {e.missionCode ?? "No mission"} · {e.status}
              </p>
            </li>
          ))}
          {data.activeEmergencies.length === 0 ? (
            <li className="px-4 py-6 text-sm text-text-secondary">No HIGH/CRITICAL open incidents.</li>
          ) : null}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-surface rounded-[2px]">
          <header className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-semibold">Rescue assets</h2>
          </header>
          <ul className="divide-y divide-border text-sm">
            {data.rescueAssets.map((a) => (
              <li key={a.assetTag} className="flex justify-between px-4 py-2">
                <span className="font-mono text-xs">{a.assetTag}</span>
                <span className="text-text-secondary">{a.stationCode}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-border bg-surface rounded-[2px]">
          <header className="border-b border-border px-4 py-3">
            <h2 className="font-display text-lg font-semibold">Response checklist</h2>
          </header>
          <ul className="space-y-2 px-4 py-3">
            {data.checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-teal" aria-hidden />
                ) : (
                  <Circle className="h-4 w-4 text-text-secondary" aria-hidden />
                )}
                {item.label}
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-4 py-3 text-xs text-text-secondary">
            <Link href="/hq/map" className="text-cyan underline-offset-2 hover:underline">
              Open simulated map
            </Link>
            {" · "}
            <Link href="/hq/emergency" className="text-cyan underline-offset-2 hover:underline">
              ECC incidents
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
