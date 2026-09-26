import { HqPageShell } from "@/components/layout/hq-page-shell";
import { PersonnelRoster } from "@/components/hq/personnel/personnel-roster";
import { TeamsPanel } from "@/components/hq/personnel/teams-panel";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HqPersonnelPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") {
    redirect("/");
  }

  const expeditionIds = session.expeditionIds;

  const [personnel, teams] = await Promise.all([
    prisma.personnel.findMany({
      where: { expeditionId: { in: expeditionIds } },
      include: { team: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.team.findMany({
      where: { expeditionId: { in: expeditionIds } },
      include: { station: true, _count: { select: { personnel: true, missions: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const rosterRows = personnel.map((p) => ({
    id: p.id,
    employeeCode: p.employeeCode,
    fullName: p.fullName,
    roleTitle: p.roleTitle,
    teamId: p.teamId,
    teamName: p.team?.name ?? null,
    medicalClearancePending: p.medicalClearancePending,
    status: p.status,
  }));

  const teamRows = teams.map((t) => ({
    id: t.id,
    name: t.name,
    callsign: t.callsign,
    stationCode: t.station?.code ?? null,
    personnelCount: t._count.personnel,
    missionCount: t._count.missions,
  }));

  return (
    <HqPageShell
      title="Personnel & Teams"
      subtitle="Roster assignments, medical clearance flags, and team structure."
    >
      <div className="space-y-8">
        <PersonnelRoster
          rows={rosterRows}
          teams={teams.map((t) => ({ id: t.id, name: t.name }))}
        />
        <TeamsPanel teams={teamRows} />
      </div>
    </HqPageShell>
  );
}
