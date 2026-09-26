import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type MissionReportSection = {
  id: string;
  title: string;
  body: string;
};

export type MissionReport = {
  missionId: string;
  missionCode: string;
  generatedAt: string;
  generator: "cryolink-synthesis-v1";
  disclaimer: string;
  sections: MissionReportSection[];
  markdown: string;
};

export async function generateMissionReport(
  missionId: string,
  expeditionIds: string[]
): Promise<MissionReport | null> {
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, expeditionId: { in: expeditionIds } },
    include: {
      team: true,
      lead: true,
      personnel: { include: { personnel: true } },
      checkIns: { orderBy: { checkedInAt: "desc" }, take: 12, include: { personnel: true } },
      incidents: { orderBy: { createdAt: "desc" }, take: 5 },
      expedition: true,
    },
  });
  if (!mission) return null;

  const crew = mission.personnel.map((p) => p.personnel.fullName).join(", ");
  const lateCheckIns = mission.checkIns.filter((c) => c.status !== "ON_TIME").length;
  const openIncidents = mission.incidents.filter(
    (i) => !["RESOLVED", "CLOSED"].includes(i.status)
  );

  const executive = [
    `Mission ${mission.code} (“${mission.title}”) is ${mission.status.replace("_", " ").toLowerCase()} under expedition ${mission.expedition.code}.`,
    `Team ${mission.team.name} with ${mission.personnel.length} assigned member(s).`,
    mission.lead ? `Field lead: ${mission.lead.fullName}.` : "",
    `Check-in cadence: every ${mission.checkInIntervalMinutes} minutes.`,
    mission.lastCheckInAt
      ? `Last check-in recorded ${mission.lastCheckInAt.toISOString().slice(0, 16)}Z.`
      : "No check-in timestamp on file.",
  ]
    .filter(Boolean)
    .join(" ");

  const timeline =
    mission.checkIns.length === 0
      ? "No check-ins logged for this mission."
      : mission.checkIns
          .map(
            (c) =>
              `• ${c.checkedInAt.toISOString().slice(0, 16)}Z — ${c.personnel.fullName} (${c.status}): ${c.message ?? "—"}`
          )
          .join("\n");

  const risks: string[] = [];
  if (mission.status === MissionStatus.OVERDUE) {
    risks.push("Return window exceeded — coordinate comms before escalating to rescue.");
  }
  if (lateCheckIns > 0) {
    risks.push(`${lateCheckIns} late/missed check-in(s) in recent history.`);
  }
  if (openIncidents.length > 0) {
    risks.push(
      `${openIncidents.length} open incident(s) linked to this mission (highest: ${openIncidents[0]?.severity}).`
    );
  }
  if (risks.length === 0) {
    risks.push("No automated risk flags from check-in or incident rules.");
  }

  const recommendations: string[] = [];
  if (mission.status === MissionStatus.OVERDUE) {
    recommendations.push("Open Rescue dashboard and verify last confirmed position.");
    recommendations.push("Attempt scheduled HF/satcom window per expedition SOP.");
  }
  if (mission.status === MissionStatus.ACTIVE) {
    recommendations.push("Maintain check-in interval; log inventory consumption at station on return.");
  }
  recommendations.push("Archive this synthesis report with audit export for reproducibility.");

  const sections: MissionReportSection[] = [
    { id: "executive", title: "Executive summary", body: executive },
    { id: "crew", title: "Crew", body: crew || "No crew assigned." },
    { id: "timeline", title: "Check-in timeline", body: timeline },
    { id: "risks", title: "Risk signals (rules-based)", body: risks.map((r) => `• ${r}`).join("\n") },
    {
      id: "recommendations",
      title: "HQ recommendations (decision support)",
      body: recommendations.map((r) => `• ${r}`).join("\n"),
    },
  ];

  if (mission.briefingNotes) {
    sections.splice(1, 0, {
      id: "briefing",
      title: "Briefing notes (source)",
      body: mission.briefingNotes,
    });
  }

  const markdown = [
    `# Mission report — ${mission.code}`,
    `_Generated ${new Date().toISOString()} · cryolink-synthesis-v1 (deterministic; not a live LLM call)_`,
    "",
    ...sections.map((s) => `## ${s.title}\n\n${s.body}\n`),
  ].join("\n");

  return {
    missionId: mission.id,
    missionCode: mission.code,
    generatedAt: new Date().toISOString(),
    generator: "cryolink-synthesis-v1",
    disclaimer:
      "This report is synthesized from expedition database state for demo decision support. Verify against ECC and field check-ins before operational use.",
    sections,
    markdown,
  };
}
