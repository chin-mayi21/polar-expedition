import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { isSessionUser, requireHqOfficial } from "@/lib/auth/require-session";
import {
  auditReproducibilityKey,
  listAuditEvents,
  parseAuditJson,
} from "@/lib/reports/audit-queries";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await requireHqOfficial();
  if (!isSessionUser(session)) return session;

  const url = new URL(request.url);
  const entityType = url.searchParams.get("entityType") ?? undefined;
  const actionParam = url.searchParams.get("action");
  const action =
    actionParam && Object.values(AuditAction).includes(actionParam as AuditAction)
      ? (actionParam as AuditAction)
      : undefined;
  const take = Number(url.searchParams.get("take") ?? "100");

  const rows = await listAuditEvents(session.expeditionIds, { entityType, action, take });

  const events = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    reproducibilityKey: auditReproducibilityKey(
      row.expedition?.code ?? null,
      row.entityType,
      row.entityId,
      row.createdAt
    ),
    actor: row.actor
      ? { id: row.actor.id, email: row.actor.email, name: row.actor.name }
      : null,
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action,
    previousState: parseAuditJson(row.previousState),
    newState: parseAuditJson(row.newState),
    metadata: parseAuditJson(row.metadata),
  }));

  return NextResponse.json({ events });
}
