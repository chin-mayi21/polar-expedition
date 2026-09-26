import { SafetyStatusCard } from "@/components/field/safety-status-card";
import { SosHoldButton } from "@/components/field/sos-hold-button";
import { getSession } from "@/lib/auth/session";
import { getFieldDashboard } from "@/lib/field/dashboard";
import { redirect } from "next/navigation";

export default async function FieldHomePage() {
  const session = await getSession();
  if (!session?.personnelId) redirect("/");

  const dashboard = await getFieldDashboard(session.personnelId);
  if (!dashboard) {
    return <p className="text-sm text-text-secondary">Personnel record not found.</p>;
  }

  const dayLabel =
    dashboard.expedition.missionDay && dashboard.expedition.missionTotalDays
      ? `Day ${dashboard.expedition.missionDay} of ${dashboard.expedition.missionTotalDays}`
      : dashboard.expedition.code;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">Field home</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {dashboard.personnel.teamName ?? "Unassigned"} · {dayLabel}
        </p>
        <p className="font-mono text-[10px] text-text-secondary">{dashboard.personnel.employeeCode}</p>
      </div>
      <SafetyStatusCard dashboard={dashboard} />
      <SosHoldButton
        missionId={dashboard.activeMission?.id}
        disabled={dashboard.safety.tone === "sos"}
      />
      {dashboard.safety.tone === "sos" ? (
        <p className="text-xs text-text-secondary">
          SOS already active for this mission — HQ is responding. Do not send duplicate signals unless situation worsens.
        </p>
      ) : null}
    </div>
  );
}
