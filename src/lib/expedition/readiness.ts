import { explainExpeditionReadiness } from "@/lib/expedition/readiness-explained";

export type ReadinessResult = {
  pass: boolean;
  blockers: string[];
};

export async function evaluateExpeditionReadiness(expeditionId: string): Promise<ReadinessResult> {
  const explained = await explainExpeditionReadiness(expeditionId);
  const blockers = explained.rules.filter((r) => !r.pass).map((r) => r.explanation);
  return { pass: explained.pass, blockers };
}
