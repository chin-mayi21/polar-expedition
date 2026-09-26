import { cn } from "@/lib/utils";
import { AlertTriangle, Radio } from "lucide-react";
import { StatusBadge } from "@/components/design/status-badge";

export type AlertCardSeverity = "warning" | "critical";

const severityConfig: Record<
  AlertCardSeverity,
  { border: string; bg: string; icon: typeof AlertTriangle; iconClass: string }
> = {
  warning: {
    border: "border-warning-border",
    bg: "bg-warning-bg",
    icon: AlertTriangle,
    iconClass: "text-warning",
  },
  critical: {
    border: "border-critical-border",
    bg: "bg-critical-bg",
    icon: Radio,
    iconClass: "text-critical",
  },
};

export type AlertCardProps = {
  severity: AlertCardSeverity;
  title: string;
  /** Monospace-friendly detail lines (timestamps, IDs) */
  lines: string[];
  statusLabel: string;
  className?: string;
};

/**
 * HQ "Attention Required" row — flat panel, left accent bar, no glass/shadow.
 */
export function AlertCard({ severity, title, lines, statusLabel, className }: AlertCardProps) {
  const cfg = severityConfig[severity];
  const Icon = cfg.icon;

  return (
    <article
      className={cn(
        "flex border border-border-default",
        "rounded-[2px]",
        cfg.bg,
        className
      )}
      role="article"
    >
      <div
        className={cn("w-1 shrink-0", severity === "warning" ? "bg-warning" : "bg-critical")}
        aria-hidden
      />
      <div className="min-w-0 flex-1 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-3">
          <div className="flex min-w-0 items-start gap-3">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", cfg.iconClass)} strokeWidth={2} aria-hidden />
            <div>
              <h3 className="font-display text-base font-semibold tracking-tight text-text-primary">{title}</h3>
              <p className="mt-1 font-sans text-xs text-text-secondary">
                {severity === "warning" ? "Attention required" : "Emergency channel"}
              </p>
            </div>
          </div>
          <StatusBadge
            label={statusLabel}
            tone={severity === "warning" ? "warning" : "critical"}
          />
        </div>
        <ul className="mt-3 space-y-1.5">
          {lines.map((line) => (
            <li key={line} className="font-mono text-xs leading-relaxed text-text-secondary">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
