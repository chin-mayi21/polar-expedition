import { HqPageShell } from "@/components/layout/hq-page-shell";
import { CargoBoard } from "@/components/hq/cargo/cargo-board";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HqCargoPage() {
  const session = await getSession();
  if (!session || session.role !== "OPERATIONS_OFFICIAL") {
    redirect("/");
  }

  const items = await prisma.cargoItem.findMany({
    where: { expeditionId: { in: session.expeditionIds } },
    include: {
      originStation: true,
      destinationStation: true,
      events: { orderBy: { createdAt: "desc" }, take: 8 },
    },
    orderBy: { manifestCode: "asc" },
  });

  const rows = items.map((c) => ({
    id: c.id,
    manifestCode: c.manifestCode,
    description: c.description,
    status: c.status,
    route: `${c.originStation?.code ?? "—"} → ${c.destinationStation?.code ?? "—"}`,
    recentEvents: c.events.map((e) => ({
      at: e.createdAt.toISOString().slice(0, 16),
      note: e.note,
      toStatus: e.toStatus,
    })),
  }));

  return (
    <HqPageShell
      title="Cargo & Logistics"
      subtitle="Manifest pipeline with evidence-backed transitions and delayed/damaged branches."
    >
      <CargoBoard items={rows} />
    </HqPageShell>
  );
}
