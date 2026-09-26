import { HeartPulse, ShieldAlert, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/design/status-badge";
import type { FamilyStatusBundle } from "@/lib/family/status";

export function FamilyWellnessCard({ wellness }: { wellness: FamilyStatusBundle["wellness"] }) {
  const tone =
    wellness.tone === "emergency" ? "critical" : wellness.tone === "attention" ? "warning" : "success";
  const Icon =
    wellness.tone === "emergency" ? ShieldAlert : wellness.tone === "attention" ? HeartPulse : ShieldCheck;

  const shared = wellness.lastSharedAt
    ? wellness.lastSharedAt.replace("T", " ").slice(0, 19) + "Z"
    : "Not yet available";

  return (
    <section className="border border-border bg-surface rounded-[4px]" aria-labelledby="family-wellness-heading">
      <header className="border-b border-border px-4 py-3">
        <h2 id="family-wellness-heading" className="font-display text-lg font-semibold text-text-primary">
          Wellness summary
        </h2>
        <p className="mt-1 text-xs text-text-secondary">Safe status only — no live GPS or HQ operations view</p>
      </header>
      <div className="space-y-4 p-4">
        <div
          className={`flex gap-3 border px-3 py-3 rounded-[2px] ${
            wellness.tone === "emergency"
              ? "border-red/40 bg-bg"
              : wellness.tone === "attention"
                ? "border-amber/40 bg-bg"
                : "border-teal/30 bg-teal-soft-bg"
          }`}
        >
          <Icon
            className={`mt-0.5 h-6 w-6 shrink-0 ${
              wellness.tone === "safe" ? "text-teal" : wellness.tone === "attention" ? "text-amber" : "text-red"
            }`}
            aria-hidden
          />
          <div>
            <StatusBadge label={wellness.headline} tone={tone} />
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{wellness.detail}</p>
          </div>
        </div>
        <p className="font-mono text-[10px] text-text-secondary">
          Last summary update shared: {shared}
        </p>
      </div>
    </section>
  );
}
