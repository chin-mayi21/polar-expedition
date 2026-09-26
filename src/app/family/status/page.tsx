import { getSession } from "@/lib/auth/session";
import { getFamilyStatusForLinkedMember } from "@/lib/family/status";
import { FamilyMemberHeader } from "@/components/family/family-member-header";
import { FamilyWellnessCard } from "@/components/family/family-wellness-card";
import { FamilyCheckInPanel } from "@/components/family/family-check-in-panel";
import { FamilyRefreshButton } from "@/components/family/family-refresh-button";
import { redirect } from "next/navigation";

export default async function FamilyStatusPage() {
  const session = await getSession();
  if (!session?.nextOfKinForId) redirect("/");

  const status = await getFamilyStatusForLinkedMember(session.nextOfKinForId);
  if (!status) {
    return (
      <p className="text-sm text-text-secondary">
        Linked expedition member could not be loaded. Run <span className="font-mono">npm run db:seed</span>.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <FamilyMemberHeader member={status.member} expedition={status.expedition} />
      <FamilyWellnessCard wellness={status.wellness} />
      <FamilyCheckInPanel lastCheckIn={status.lastCheckIn} recentCheckIns={status.recentCheckIns} />
      <div className="flex flex-col gap-3 border border-border bg-bg px-4 py-3 text-xs leading-relaxed text-text-secondary rounded-[2px]">
        <p>
          This portal shows <strong className="font-medium text-text-primary">confirmed</strong> check-ins for your
          linked member only. It does not expose other teams, cargo, inventory, or HQ investigation notes.
        </p>
        <FamilyRefreshButton />
      </div>
    </div>
  );
}
