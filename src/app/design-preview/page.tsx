import { AlertCard } from "@/components/design/alert-card";
import { StatusBadge } from "@/components/design/status-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Clock, Package, ShieldAlert } from "lucide-react";

export default function DesignPreviewPage() {
  return (
    <div className="min-h-dvh bg-bg-base text-text-primary">
      <header className="flex items-center justify-between border-b border-border-subtle bg-bg-raised px-6 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">Design approval</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Visual direction sample</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto grid max-w-4xl gap-10 px-6 py-10 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Status badges</h2>
          <p className="text-sm text-text-secondary">
            Dot + label (+ icon). Amber and red are reserved for real alert semantics.
          </p>
          <div className="flex flex-wrap gap-2 border border-border-default bg-bg-panel p-4 rounded-[2px]">
            <StatusBadge label="Draft" tone="neutral" icon={Package} />
            <StatusBadge label="In transit" tone="accent" />
            <StatusBadge label="Synced" tone="success" />
            <StatusBadge label="Check-in overdue" tone="warning" icon={Clock} />
            <StatusBadge label="SOS active" tone="critical" icon={ShieldAlert} />
          </div>
          <p className="font-mono text-xs text-text-tertiary">
            MSN-ALPHA-07 · ERT +05:30 · 2026-01-16T14:22:00Z
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Alert cards</h2>
          <p className="text-sm text-text-secondary">Flat panels, 1px borders, left severity bar — no blur or shadow stack.</p>
          <AlertCard
            severity="warning"
            title="Check-in window missed — Team Alpha"
            statusLabel="Overdue 47m"
            lines={[
              "mission_id: MSN-ALPHA-07",
              "last_checkin: 2026-01-16T11:30:00Z (Simulated GPS)",
              "next_action: Contact field lead — not auto-escalated",
            ]}
          />
          <AlertCard
            severity="critical"
            title="SOS signal — hold-to-confirm received"
            statusLabel="Response active"
            lines={[
              "incident_id: INC-2026-003",
              "last_confirmed: 71.02°S 12.14°E @ 10:15Z",
              "current_status: Investigating — separate from last fix",
            ]}
          />
        </section>
      </div>
    </div>
  );
}
