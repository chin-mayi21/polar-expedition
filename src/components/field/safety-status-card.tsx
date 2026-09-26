import { MapPin, Radio, ShieldAlert, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/design/status-badge";
import type { FieldDashboard } from "@/lib/field/dashboard";

type Props = {
  dashboard: Pick<FieldDashboard, "safety" | "personnel" | "activeMission">;
};

export function SafetyStatusCard({ dashboard }: Props) {
  const { safety, personnel, activeMission } = dashboard;
  const tone =
    safety.tone === "sos" ? "critical" : safety.tone === "caution" ? "warning" : "success";
  const Icon = safety.tone === "sos" ? ShieldAlert : ShieldCheck;

  const syncLabel = personnel.lastDeviceSyncAt
    ? personnel.lastDeviceSyncAt.replace("T", " ").slice(0, 19) + "Z"
    : "Never";

  return (
    <aside
      className="border border-border bg-surface rounded-[4px]"
      aria-labelledby="safety-status-heading"
    >
      <header className="border-b border-border px-4 py-3">
        <h2 id="safety-status-heading" className="font-display text-lg font-semibold text-text-primary">
          Current safety status
        </h2>
      </header>
      <div className="space-y-4 p-4">
        <div
          className={`flex items-center gap-3 border px-3 py-3 rounded-[2px] ${
            safety.tone === "sos"
              ? "border-red/40 bg-bg"
              : safety.tone === "caution"
                ? "border-amber/40 bg-bg"
                : "border-teal/30 bg-teal-soft-bg"
          }`}
        >
          <Icon
            className={`h-6 w-6 shrink-0 ${safety.tone === "safe" ? "text-teal" : safety.tone === "caution" ? "text-amber" : "text-red"}`}
            strokeWidth={2}
            aria-hidden
          />
          <div>
            <StatusBadge label={safety.headline} tone={tone} />
            <p className="mt-2 text-sm text-text-primary">{safety.detail}</p>
          </div>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2 border-b border-border pb-2">
            <dt className="text-text-secondary">Beacon</dt>
            <dd className="flex items-center gap-1.5 font-medium text-text-primary">
              <Radio className="h-3.5 w-3.5 text-teal" aria-hidden />
              {personnel.lastDeviceSyncAt ? "Connected" : "No recent sync"}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-secondary">Last sync</dt>
            <dd className="font-mono text-xs text-text-primary">{syncLabel}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-secondary">Position feed</dt>
            <dd className="font-mono text-xs text-amber">Simulated</dd>
          </div>
          {activeMission ? (
            <div className="flex justify-between gap-2 border-t border-border pt-2">
              <dt className="text-text-secondary">Mission</dt>
              <dd className="font-mono text-xs text-cyan">{activeMission.code}</dd>
            </div>
          ) : null}
        </dl>

        <p className="border-t border-border pt-3 text-xs leading-relaxed text-text-secondary">
          <MapPin className="mr-1 inline h-3.5 w-3.5 text-teal" aria-hidden />
          Family visibility updates after HQ processes check-ins — not live GPS.
        </p>
      </div>
    </aside>
  );
}
