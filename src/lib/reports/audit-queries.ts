import type { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditListOptions = {
  entityType?: string;
  action?: AuditAction;
  take?: number;
};

export async function listAuditEvents(expeditionIds: string[], options: AuditListOptions = {}) {
  if (expeditionIds.length === 0) return [];

  const take = Math.min(options.take ?? 100, 500);

  return prisma.auditEvent.findMany({
    where: {
      expeditionId: { in: expeditionIds },
      ...(options.entityType ? { entityType: options.entityType } : {}),
      ...(options.action ? { action: options.action } : {}),
    },
    include: {
      actor: { select: { id: true, email: true, name: true } },
      expedition: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export function auditReproducibilityKey(
  expeditionCode: string | null,
  entityType: string,
  entityId: string,
  createdAt: Date
): string {
  const ts = createdAt.toISOString();
  return `${expeditionCode ?? "EXP"}:${entityType}:${entityId}:${ts}`;
}

export function parseAuditJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
