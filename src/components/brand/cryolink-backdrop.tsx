import { cn } from "@/lib/utils";

/** Soft animated mesh behind marketing / auth screens */
export function CryoLinkBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      <div className="cryolink-orb cryolink-orb-a" />
      <div className="cryolink-orb cryolink-orb-b" />
      <div className="cryolink-grid" />
    </div>
  );
}
