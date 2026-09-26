import { cn } from "@/lib/utils";

export function CryoLinkLogo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("leading-tight", className)}>
      <p
        className={cn(
          "font-display font-semibold tracking-tight text-navy",
          compact ? "text-base" : "text-lg"
        )}
      >
        CryoLink
      </p>
    </div>
  );
}
