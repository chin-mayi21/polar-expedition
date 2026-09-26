import { HqPageShell } from "@/components/layout/hq-page-shell";
import { MissionsBoard } from "@/components/hq/missions/missions-board";
import { MissionReportPanel } from "@/components/hq/missions/mission-report-panel";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HqMissionsPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") {
    redirect("/");
  }

  const missions = await prisma.mission.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: {
      team: true,
      personnel: { include: { personnel: true } },
      _count: { select: { checkIns: true } },
    },
    orderBy: { plannedDepartAt: "desc" },
  });

  const rows = missions.map((m) => ({
    id: m.id,
    code: m.code,
    title: m.title,
    status: m.status,
    teamName: m.team.name,
    expectedReturnAt: m.expectedReturnAt.toISOString(),
    checkInIntervalMinutes: m.checkInIntervalMinutes,
    checkInCount: m._count.checkIns,
    crew: m.personnel.map((mp) => mp.personnel.fullName),
  }));

  return (
    <HqPageShell
      title="Missions"
      subtitle="Controlled status transitions — no raw status dropdown. Check-in cadence enforced on overview."
    >
      <div className="space-y-10">
        <MissionsBoard missions={rows} />
        <MissionReportPanel
          missions={rows.map((m) => ({ id: m.id, code: m.code, title: m.title }))}
        />
      </div>
    </HqPageShell>
  );
}
