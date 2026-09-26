import { HqPageShell } from "@/components/layout/hq-page-shell";
import { ExpeditionWorkflow } from "@/components/hq/expedition/expedition-workflow";
import { CreateExpeditionCard } from "@/components/hq/expedition/create-expedition-card";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HqExpeditionsPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") redirect("/");

  const expeditions = await prisma.expedition.findMany({
    where: { id: { in: session.expeditionIds } },
    orderBy: { createdAt: "desc" },
  });

  const primary = expeditions[0];

  return (
    <HqPageShell
      title="Expeditions"
      subtitle="Nine-step planning workflow — readiness gate blocks activation with specific reasons."
    >
      <CreateExpeditionCard />
      {primary ? (
        <div className="mt-8">
          <ExpeditionWorkflow expeditionId={primary.id} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-text-secondary">Create a draft expedition to begin the workflow.</p>
      )}
    </HqPageShell>
  );
}
