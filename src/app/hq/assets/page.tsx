import { HqPageShell } from "@/components/layout/hq-page-shell";
import { AssetsBoard } from "@/components/hq/assets/assets-board";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HqAssetsPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") {
    redirect("/");
  }

  const expeditionId = session.expeditionIds[0];
  if (!expeditionId) {
    return (
      <HqPageShell title="Assets" subtitle="No expedition scope assigned.">
        <p className="text-sm text-text-secondary">Link your account to an expedition scope.</p>
      </HqPageShell>
    );
  }

  const assets = await prisma.asset.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: { station: true },
    orderBy: { assetTag: "asc" },
  });

  const rows = assets.map((a) => ({
    id: a.id,
    assetTag: a.assetTag,
    name: a.name,
    category: a.category,
    status: a.status,
    stationCode: a.station?.code ?? null,
  }));

  return (
    <HqPageShell title="Assets" subtitle="Vehicles, generators, and critical equipment across stations.">
      <AssetsBoard assets={rows} expeditionId={expeditionId} />
    </HqPageShell>
  );
}
