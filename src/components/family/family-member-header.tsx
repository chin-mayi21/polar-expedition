import type { FamilyStatusBundle } from "@/lib/family/status";

export function FamilyMemberHeader({
  member,
  expedition,
}: {
  member: FamilyStatusBundle["member"];
  expedition: FamilyStatusBundle["expedition"];
}) {
  const dayLabel =
    expedition.missionDay && expedition.missionTotalDays
      ? `Day ${expedition.missionDay} of ${expedition.missionTotalDays}`
      : expedition.season;

  return (
    <header className="border-b border-border pb-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">Linked member</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-text-primary">
        {member.fullName}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">{member.roleLabel}</p>
      <p className="mt-1 text-sm text-text-primary">{member.deploymentLabel}</p>
      <p className="mt-3 font-mono text-xs text-text-secondary">
        {expedition.name} · {dayLabel}
      </p>
    </header>
  );
}
