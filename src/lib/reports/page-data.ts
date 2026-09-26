import type { ExplainedReadiness, ReadinessRule } from "@/lib/expedition/readiness-explained";
import { explainExpeditionReadiness } from "@/lib/expedition/readiness-explained";
import { listInventoryForExpeditions } from "@/lib/inventory/queries";
import {
  auditReproducibilityKey,
  listAuditEvents,
  parseAuditJson,
} from "@/lib/reports/audit-queries";
import { fetchOpsSummary } from "@/lib/reports/ops-summary";
import type { AuditTrailRow } from "@/components/hq/reports/audit-trail-panel";

export type ReportsPageData = {
  summary: Awaited<ReturnType<typeof fetchOpsSummary>>;
  auditRows: AuditTrailRow[];
  simItems: {
    id: string;
    sku: string;
    onHand: number;
    threshold: number;
    dailyRate: number | null;
    unit: string;
  }[];
  explained: ExplainedReadiness;
  readinessError: string | null;
};

const readinessEngineErrorRule = (message: string): ReadinessRule => ({
  key: "readiness_engine_error",
  label: "Readiness engine",
  category: "expedition",
  pass: false,
  explanation:
    "Could not evaluate readiness rules. Stop the dev server, run `npx prisma generate`, then restart. Details: " +
    message.slice(0, 200),
});

async function loadExplained(
  expeditionId: string | undefined
): Promise<{ explained: ExplainedReadiness; readinessError: string | null }> {
  if (!expeditionId) {
    return { explained: { pass: true, rules: [] }, readinessError: null };
  }
  try {
    const explained = await explainExpeditionReadiness(expeditionId);
    return { explained, readinessError: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Readiness evaluation failed.";
    return {
      explained: {
        pass: false,
        rules: [readinessEngineErrorRule(message)],
      },
      readinessError: message,
    };
  }
}

export async function loadReportsPageData(expeditionIds: string[]): Promise<ReportsPageData> {
  const expeditionId = expeditionIds[0];

  const [summary, audits, inventory, explainedBundle] = await Promise.all([
    fetchOpsSummary(expeditionIds),
    listAuditEvents(expeditionIds, { take: 150 }),
    listInventoryForExpeditions(expeditionIds),
    loadExplained(expeditionId),
  ]);

  const auditRows: AuditTrailRow[] = audits.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    reproducibilityKey: auditReproducibilityKey(
      row.expedition?.code ?? null,
      row.entityType,
      row.entityId,
      row.createdAt
    ),
    actorEmail: row.actor?.email ?? null,
    actorName: row.actor?.name ?? null,
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action,
    previousState: parseAuditJson(row.previousState),
    newState: parseAuditJson(row.newState),
    metadata: parseAuditJson(row.metadata),
  }));

  const simItems = inventory
    .filter((r) => r.dailyConsumptionRate)
    .map((r) => ({
      id: r.id,
      sku: r.sku,
      onHand: Number(r.onHand),
      threshold: Number(r.lowStockThreshold),
      dailyRate: r.dailyConsumptionRate ? Number(r.dailyConsumptionRate) : null,
      unit: r.unit,
    }));

  return {
    summary,
    auditRows,
    simItems,
    explained: explainedBundle.explained,
    readinessError: explainedBundle.readinessError,
  };
}
