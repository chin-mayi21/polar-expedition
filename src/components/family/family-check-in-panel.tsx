import { MapPin } from "lucide-react";
import type { FamilyStatusBundle } from "@/lib/family/status";

function formatUtc(iso: string) {
  return iso.replace("T", " ").slice(0, 19) + "Z";
}

export function FamilyCheckInPanel({
  lastCheckIn,
  recentCheckIns,
}: {
  lastCheckIn: FamilyStatusBundle["lastCheckIn"];
  recentCheckIns: FamilyStatusBundle["recentCheckIns"];
}) {
  return (
    <section className="border border-border bg-surface rounded-[4px]" aria-labelledby="family-checkin-heading">
      <header className="border-b border-border px-4 py-3">
        <h2 id="family-checkin-heading" className="font-display text-lg font-semibold text-text-primary">
          Last confirmed check-in
        </h2>
      </header>
      <div className="p-4">
        {!lastCheckIn ? (
          <p className="text-sm text-text-secondary">No confirmed check-ins are on record yet.</p>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-cyan">{formatUtc(lastCheckIn.checkedInAt)}</p>
            <p className="text-sm font-medium text-text-primary">{lastCheckIn.statusLabel}</p>
            {lastCheckIn.message ? (
              <p className="text-sm leading-relaxed text-text-secondary">{lastCheckIn.message}</p>
            ) : null}
            <p className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin className="h-3.5 w-3.5 text-amber" aria-hidden />
              {lastCheckIn.positionLabel}
              {lastCheckIn.simulatedLatitude != null && lastCheckIn.simulatedLongitude != null ? (
                <span className="font-mono text-[10px] text-text-primary">
                  ({lastCheckIn.simulatedLatitude.toFixed(2)}, {lastCheckIn.simulatedLongitude.toFixed(2)})
                </span>
              ) : null}
            </p>
          </div>
        )}

        {recentCheckIns.length > 1 ? (
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-text-secondary">Recent history</h3>
            <ul className="mt-2 space-y-2">
              {recentCheckIns.slice(1).map((c, i) => (
                <li key={i} className="font-mono text-[10px] text-text-secondary">
                  {formatUtc(c.checkedInAt)} · {c.statusLabel}
                  {c.message ? ` — ${c.message.slice(0, 80)}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
