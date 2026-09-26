import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatusBadgeTone = "neutral" | "accent" | "success" | "warning" | "critical";

const toneStyles: Record<
  StatusBadgeTone,
  { dot: string; border: string; text: string; bg: string }
> = {
  neutral: {
    dot: "bg-text-secondary",
    border: "border-border",
    text: "text-text-secondary",
    bg: "bg-bg",
  },
  accent: {
    dot: "bg-cyan",
    border: "border-border",
    text: "text-text-primary",
    bg: "bg-surface",
  },
  success: {
    dot: "bg-teal",
    border: "border-border",
    text: "text-text-primary",
    bg: "bg-teal-soft-bg",
  },
  warning: {
    dot: "bg-amber",
    border: "border-amber/40",
    text: "text-text-primary",
    bg: "bg-bg",
  },
  critical: {
    dot: "bg-red",
    border: "border-red/40",
    text: "text-text-primary",
    bg: "bg-bg",
  },
};

export type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  icon?: LucideIcon;
  className?: string;
};

export function StatusBadge({ label, tone = "neutral", icon: Icon, className }: StatusBadgeProps) {
  const s = toneStyles[tone];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 border px-2 py-0.5 font-sans text-xs font-medium leading-tight rounded-[2px]",
        s.border,
        s.bg,
        s.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-[1px]", s.dot)} aria-hidden />
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}
