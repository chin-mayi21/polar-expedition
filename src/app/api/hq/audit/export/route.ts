import { NextResponse } from "next/server";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import {
  auditReproducibilityKey,
  listAuditEvents,
  parseAuditJson,
} from "@/lib/reports/audit-queries";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const rows = await listAuditEvents(session.expeditionIds, { take: 500 });
  const exportedAt = new Date().toISOString();

  const packet = {
    schema: "cryolink-audit-export-v1",
    exportedAt,
    expeditionIds: session.expeditionIds,
    eventCount: rows.length,
    events: rows.map((row) => ({
      id: row.id,
      reproducibilityKey: auditReproducibilityKey(
        row.expedition?.code ?? null,
        row.entityType,
        row.entityId,
        row.createdAt
      ),
      createdAt: row.createdAt.toISOString(),
      actor: row.actor
        ? { email: row.actor.email, name: row.actor.name }
        : null,
      entityType: row.entityType,
      entityId: row.entityId,
      action: row.action,
      previousState: parseAuditJson(row.previousState),
      newState: parseAuditJson(row.newState),
      metadata: parseAuditJson(row.metadata),
    })),
  };

  const body = JSON.stringify(packet, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cryolink-audit-${exportedAt.slice(0, 10)}.json"`,
    },
  });
}
