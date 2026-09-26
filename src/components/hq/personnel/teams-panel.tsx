export type TeamRow = {
  id: string;
  name: string;
  callsign: string | null;
  stationCode: string | null;
  personnelCount: number;
  missionCount: number;
};

export function TeamsPanel({ teams }: { teams: TeamRow[] }) {
  return (
    <div className="border border-border bg-surface rounded-[2px]">
      <header className="border-b border-border px-4 py-3">
        <h2 className="font-display text-base font-semibold">Teams</h2>
      </header>
      <ul className="divide-y divide-border">
        {teams.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-text-primary">{t.name}</p>
              <p className="font-mono text-[10px] text-text-secondary">
                {t.callsign ?? "—"} · {t.stationCode ?? "No station"}
              </p>
            </div>
            <p className="font-mono text-xs text-text-secondary">
              {t.personnelCount} personnel · {t.missionCount} missions
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
