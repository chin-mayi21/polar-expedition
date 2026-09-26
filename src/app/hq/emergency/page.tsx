import { HqPageShell } from "@/components/layout/hq-page-shell";
import { EccIncidentBoard } from "@/components/hq/emergency/ecc-incident-board";
import { ReadinessRulesPanel } from "@/components/hq/emergency/readiness-rules-panel";
import { getSession } from "@/lib/auth/session";
import { listIncidentsForExpeditions } from "@/lib/emergency/queries";
import { explainExpeditionReadiness } from "@/lib/expedition/readiness-explained";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HqEmergencyPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const expeditionId = session.expeditionIds[0];
  const [incidents, expedition] = await Promise.all([
    listIncidentsForExpeditions(session.expeditionIds),
    expeditionId
      ? prisma.expedition.findUnique({ where: { id: expeditionId } })
      : Promise.resolve(null),
  ]);

  const explained = expeditionId
    ? await explainExpeditionReadiness(expeditionId)
    : { pass: false, rules: [] };

  const rows = incidents.map((inc) => ({
    id: inc.id,
    title: inc.title,
    severity: inc.severity,
    status: inc.status,
    summary: inc.summary,
    currentStatusSummary: inc.currentStatusSummary,
    createdAt: inc.createdAt.toISOString(),
    acknowledgedAt: inc.acknowledgedAt?.toISOString() ?? null,
    resolvedAt: inc.resolvedAt?.toISOString() ?? null,
    lastConfirmedAt: inc.lastConfirmedAt?.toISOString() ?? null,
    lastConfirmedLat: inc.lastConfirmedLat,
    lastConfirmedLng: inc.lastConfirmedLng,
    missionCode: inc.mission?.code ?? null,
    teamName: inc.mission?.team.name ?? null,
    crewNames: inc.mission?.personnel.map((mp) => mp.personnel.fullName) ?? [],
  }));

  return (
    <HqPageShell
      title="Emergency Control Center"
      subtitle="Incident lifecycle and emergency packets — separate from connectivity visibility warnings."
    >
      <div className="space-y-10">
        <EccIncidentBoard incidents={rows} />
        {expedition ? (
          <ReadinessRulesPanel
            expeditionName={expedition.name}
            pass={explained.pass}
            rules={explained.rules}
          />
        ) : null}
      </div>
    </HqPageShell>
  );
}
