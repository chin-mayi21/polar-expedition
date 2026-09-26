import Link from "next/link";
import { HqPageShell } from "@/components/layout/hq-page-shell";
import { OpsSummaryCards } from "@/components/hq/reports/ops-summary-cards";
import { AuditTrailPanel } from "@/components/hq/reports/audit-trail-panel";
import { ReadinessRulesPanel } from "@/components/hq/emergency/readiness-rules-panel";
import { ResupplySimulator } from "@/components/hq/inventory/resupply-simulator";
import { getSession } from "@/lib/auth/session";
import { loadReportsPageData } from "@/lib/reports/page-data";
import { redirect } from "next/navigation";

export default async function HqReportsPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const data = await loadReportsPageData(session.expeditionIds);

  return (
    <HqPageShell
      title="Reports & Audit"
      subtitle="Operational snapshot, resupply what-if, explainable readiness, and exportable audit packets."
    >
      <div className="space-y-10">
        {data.readinessError ? (
          <p className="border border-amber/40 bg-bg px-4 py-3 text-sm text-text-primary rounded-[2px]">
            Readiness rules could not load fully. If this persists, stop <span className="font-mono">npm run dev</span>,
            run <span className="font-mono">npx prisma generate</span>, then restart the dev server.
          </p>
        ) : null}

        {data.summary ? <OpsSummaryCards summary={data.summary} /> : null}

        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">Resupply simulator</h2>
          <p className="mt-1 text-xs text-text-secondary">
            Same ledger-backed model as Inventory — delay scenarios for decision support.
          </p>
          <div className="mt-4">
            {data.simItems.length > 0 ? (
              <ResupplySimulator items={data.simItems} />
            ) : (
              <p className="text-sm text-text-secondary">No consumption rates configured.</p>
            )}
          </div>
        </div>

        {data.summary?.expedition ? (
          <ReadinessRulesPanel
            expeditionName={data.summary.expedition.name}
            pass={data.explained.pass}
            rules={data.explained.rules}
          />
        ) : null}

        <AuditTrailPanel rows={data.auditRows} />
        <p className="text-center text-xs text-text-secondary">
          <Link href="/hq/audit" className="text-cyan underline-offset-2 hover:underline">
            Audit-only view
          </Link>
        </p>
      </div>
    </HqPageShell>
  );
}
