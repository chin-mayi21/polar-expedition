import { MissionPanel } from "@/components/field/mission-panel";
import { getSession } from "@/lib/auth/session";
import { getFieldDashboard } from "@/lib/field/dashboard";
import { redirect } from "next/navigation";

export default async function FieldMissionPage() {
  const session = await getSession();
  if (!session?.personnelId) redirect("/");

  const dashboard = await getFieldDashboard(session.personnelId);
  if (!dashboard) redirect("/");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold">Mission</h1>
      <MissionPanel activeMission={dashboard.activeMission} recentCheckIns={dashboard.recentCheckIns} />
    </div>
  );
}
