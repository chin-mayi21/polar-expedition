import { MapPin } from "lucide-react";

export type FieldPositionRow = {
  id: string;
  team: string;
  missionCode: string;
  personnel: string;
  checkedInAt: string;
  lat: string;
  lng: string;
};

export function FieldPositionsPanel({ rows }: { rows: FieldPositionRow[] }) {
  return (
    <section className="border border-border bg-surface rounded-[2px]">
      <header className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold text-text-primary">Last-confirmed positions</h2>
        <p className="text-xs text-amber">Simulated position feed — from latest check-ins, not live GPS.</p>
      </header>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-text-secondary">No check-ins with coordinates in scope.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-teal" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {row.team} · {row.missionCode}
                  </p>
                  <p className="text-xs text-text-secondary">{row.personnel}</p>
                  <p className="mt-1 font-mono text-[10px] text-text-secondary">
                    {row.lat}, {row.lng} · {row.checkedInAt}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
