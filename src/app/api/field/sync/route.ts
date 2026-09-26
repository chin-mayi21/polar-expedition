import { NextResponse } from "next/server";
import { isSessionUser, requireFieldPersonnel } from "@/lib/auth/require-session";
import { applyFieldOperation } from "@/lib/field/apply-operation";
import { syncBodySchema } from "@/lib/field/operations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireFieldPersonnel();
  if (!isSessionUser(session)) return session;

  const parsed = syncBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sync payload" }, { status: 400 });
  }

  const expeditionId = session.expeditionIds[0];
  if (!expeditionId) {
    return NextResponse.json({ error: "No expedition scope" }, { status: 403 });
  }

  const ctx = {
    userId: session.id,
    personnelId: session.personnelId!,
    expeditionId,
  };

  const results: {
    clientOperationId: string;
    status: "applied" | "duplicate" | "failed";
    entityId?: string;
    error?: string;
  }[] = [];

  for (const op of parsed.data.operations) {
    try {
      const outcome = await applyFieldOperation(
        op.clientOperationId,
        op.operationType,
        op.payload,
        ctx
      );
      results.push({
        clientOperationId: op.clientOperationId,
        status: outcome.status === "duplicate" ? "duplicate" : "applied",
        entityId: outcome.entityId,
      });
    } catch (err) {
      results.push({
        clientOperationId: op.clientOperationId,
        status: "failed",
        error: err instanceof Error ? err.message : "Operation failed",
      });
    }
  }

  const anyFailed = results.some((r) => r.status === "failed");
  return NextResponse.json(
    { results },
    { status: anyFailed ? 207 : 200 }
  );
}
