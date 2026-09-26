import Link from "next/link";
import { HqPageShell } from "@/components/layout/hq-page-shell";
import { AuditTrailPanel } from "@/components/hq/reports/audit-trail-panel";
import { getSession } from "@/lib/auth/session";
import { loadReportsPageData } from "@/lib/reports/page-data";
import { redirect } from "next/navigation";

export default async function HqAuditPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const { auditRows, summary } = await loadReportsPageData(session.expeditionIds);

  return (
    <HqPageShell
      title="Audit trail"
      subtitle="Immutable-style event log with reproducible previous/new state packets."
    >
      <div className="space-y-6">
        <p className="text-sm text-text-secondary">
          Full reports (resupply, readiness, ops summary) live on{" "}
          <Link href="/hq/reports" className="text-cyan underline-offset-2 hover:underline">
            Reports & Audit
          </Link>
          . {summary?.auditEventCount ?? 0} events in expedition scope.
        </p>
        <AuditTrailPanel rows={auditRows} />
      </div>
    </HqPageShell>
  );
}
