import { HqPageShell } from "@/components/layout/hq-page-shell";
import { RescueDashboardView } from "@/components/hq/rescue/rescue-dashboard";
import { getSession } from "@/lib/auth/session";
import { fetchRescueDashboard } from "@/lib/rescue/dashboard";
import { redirect } from "next/navigation";

export default async function HqRescuePage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const data = await fetchRescueDashboard(session.expeditionIds);
  if (!data) {
    return (
      <HqPageShell title="Rescue dashboard" subtitle="No expedition scope.">
        <p className="text-sm text-text-secondary">Assign expedition scope to your HQ account.</p>
      </HqPageShell>
    );
  }

  return (
    <HqPageShell
      title="Rescue dashboard"
      subtitle="Overdue missions, emergency linkage, assets, and response checklist — distances are simulated."
    >
      <RescueDashboardView data={data} />
    </HqPageShell>
  );
}
