import { prisma } from "@/lib/prisma";
import { CargoItemStatus, MissionStatus } from "@prisma/client";

export type ReadinessRuleCategory =
  | "missions"
  | "cargo"
  | "personnel"
  | "checklist"
  | "assets"
  | "expedition";

export type ReadinessRule = {
  key: string;
  label: string;
  category: ReadinessRuleCategory;
  pass: boolean;
  explanation: string;
};

export type ExplainedReadiness = {
  pass: boolean;
  rules: ReadinessRule[];
};

export async function explainExpeditionReadiness(expeditionId: string): Promise<ExplainedReadiness> {
  const rules: ReadinessRule[] = [];

  const expedition = await prisma.expedition.findUnique({ where: { id: expeditionId } });
  if (!expedition) {
    return {
      pass: false,
      rules: [
        {
          key: "expedition_exists",
          label: "Expedition record",
          category: "expedition",
          pass: false,
          explanation: "Expedition not found.",
        },
      ],
    };
  }

  rules.push({
    key: "destination",
    label: "Destination documented",
    category: "expedition",
    pass: Boolean(expedition.destination?.trim()),
    explanation: expedition.destination?.trim()
      ? `Destination set: ${expedition.destination}.`
      : "Expedition destination is not set.",
  });

  rules.push({
    key: "planned_dates",
    label: "Planned window",
    category: "expedition",
    pass: Boolean(expedition.plannedStart && expedition.plannedEnd),
    explanation:
      expedition.plannedStart && expedition.plannedEnd
        ? `Window ${expedition.plannedStart.toISOString().slice(0, 10)} → ${expedition.plannedEnd.toISOString().slice(0, 10)}.`
        : "Expedition planned start/end dates are required.",
  });

  const missions = await prisma.mission.findMany({
    where: {
      expeditionId,
      status: { in: [MissionStatus.PLANNED, MissionStatus.ACTIVE, MissionStatus.OVERDUE] },
    },
    include: { personnel: true, team: true },
  });

  const missionsWithoutTeam = missions.filter((m) => !m.teamId);
  rules.push({
    key: "missions_teams",
    label: "Missions have teams",
    category: "missions",
    pass: missionsWithoutTeam.length === 0,
    explanation:
      missionsWithoutTeam.length === 0
        ? `All ${missions.length} active/planned mission(s) have teams.`
        : `${missionsWithoutTeam.length} mission(s) missing team assignment (e.g. ${missionsWithoutTeam[0]?.code}).`,
  });

  const missionsWithoutCrew = missions.filter((m) => m.personnel.length === 0);
  rules.push({
    key: "missions_crew",
    label: "Missions have crew",
    category: "missions",
    pass: missionsWithoutCrew.length === 0,
    explanation:
      missionsWithoutCrew.length === 0
        ? "Every planned/active mission has at least one crew member."
        : `${missionsWithoutCrew.length} mission(s) have no assigned personnel.`,
  });

  const unmanifested = await prisma.cargoItem.count({
    where: { expeditionId, status: CargoItemStatus.CREATED },
  });
  rules.push({
    key: "cargo_manifest",
    label: "Cargo manifest advanced",
    category: "cargo",
    pass: unmanifested === 0,
    explanation:
      unmanifested === 0
        ? "No cargo items stuck in Created."
        : `${unmanifested} cargo item(s) still in Created — advance manifest status.`,
  });

  const medPending = await prisma.personnel.count({
    where: { expeditionId, medicalClearancePending: true },
  });
  rules.push({
    key: "medical_clearance",
    label: "Medical clearance",
    category: "personnel",
    pass: medPending === 0,
    explanation:
      medPending === 0
        ? "All personnel cleared medically."
        : `${medPending} personnel pending medical clearance.`,
  });

  const checklist = await prisma.expeditionReadinessItem.findMany({
    where: { expeditionId },
    orderBy: { key: "asc" },
  });
  for (const item of checklist) {
    rules.push({
      key: `checklist_${item.key}`,
      label: item.label,
      category: "checklist",
      pass: item.isComplete,
      explanation: item.isComplete
        ? `Checklist complete: ${item.label}.`
        : `Readiness checklist incomplete: ${item.label}.`,
    });
  }

  const stations = await prisma.station.count({ where: { expeditionId } });
  const operationalAssets = await prisma.asset.count({
    where: { expeditionId, status: "OPERATIONAL" },
  });
  rules.push({
    key: "operational_assets",
    label: "Operational assets",
    category: "assets",
    pass: stations === 0 || operationalAssets > 0,
    explanation:
      stations === 0
        ? "No stations — asset rule skipped."
        : operationalAssets > 0
          ? `${operationalAssets} operational asset(s) registered across stations.`
          : "No operational assets registered for expedition stations.",
  });

  const pass = rules.every((r) => r.pass);
  return { pass, rules };
}
