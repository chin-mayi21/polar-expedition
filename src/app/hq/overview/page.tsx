import { HqPageShell } from "@/components/layout/hq-page-shell";
import { AttentionRequiredPanel } from "@/components/hq/attention-required-panel";
import { ActivityFeedPanel } from "@/components/hq/activity-feed-panel";
import { FieldPositionsPanel } from "@/components/hq/field-positions-panel";
import { fetchOverviewBundle } from "@/lib/hq/overview-data";
import { getSession } from "@/lib/auth/session";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HqOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const bundle = await fetchOverviewBundle(session.expeditionIds);

  return (
    <HqPageShell
      title="Overview"
      subtitle="Exceptions first — then expedition health, resources, positions, and activity."
    >
      <div className="space-y-6">
        <AttentionRequiredPanel items={bundle.attention} />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-border bg-surface p-4 rounded-[2px]">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Expedition</p>
            <p className="mt-2 font-display text-lg font-semibold text-text-primary">
              {bundle.expedition?.name ?? "—"}
            </p>
            {bundle.missionDay && bundle.missionTotalDays ? (
              <p className="mt-1 font-mono text-sm text-text-primary">
                Day {bundle.missionDay} of {bundle.missionTotalDays}
              </p>
            ) : null}
          </div>
          <div className="border border-border bg-surface p-4 rounded-[2px]">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Inventory</p>
            <p className="mt-2 font-mono text-sm text-text-primary">
              {bundle.resource.inventoryCritical} critical · {bundle.resource.inventoryLow} low
            </p>
          </div>
          <div className="border border-border bg-surface p-4 rounded-[2px]">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Assets</p>
            <p className="mt-2 font-mono text-sm text-text-primary">
              {bundle.resource.assetsOperational} operational · {bundle.resource.assetsMaintenance} maintenance
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <FieldPositionsPanel rows={bundle.positionRows} />
          <ActivityFeedPanel items={bundle.feed} />
        </div>
        <p className="text-center text-xs text-text-secondary">
          <Link href="/hq/map" className="text-cyan underline-offset-2 hover:underline">
            Open MapLibre field map
          </Link>
          {" · "}
          <Link href="/hq/rescue" className="text-cyan underline-offset-2 hover:underline">
            Rescue dashboard
          </Link>
        </p>
      </div>
    </HqPageShell>
  );
}
