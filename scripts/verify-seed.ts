import { PrismaClient } from "@prisma/client";
import { listInventoryForExpeditions } from "../src/lib/inventory/queries";

const prisma = new PrismaClient();

async function main() {
  const expedition = await prisma.expedition.findFirst({
    where: { code: "ISEA-44" },
    include: { stations: true },
  });
  if (!expedition) {
    console.error("MISSING: expedition ISEA-44 — run npm run db:seed");
    process.exit(1);
  }

  const [personnel, teams, missions, cargo, inventory, assets, incidents, users, checkIns, audit] =
    await Promise.all([
      prisma.personnel.count({ where: { expeditionId: expedition.id } }),
      prisma.team.count({ where: { expeditionId: expedition.id } }),
      prisma.mission.count({ where: { expeditionId: expedition.id } }),
      prisma.cargoItem.count({ where: { expeditionId: expedition.id } }),
      prisma.inventoryItem.count({ where: { expeditionId: expedition.id } }),
      prisma.asset.count({ where: { expeditionId: expedition.id } }),
      prisma.incident.count({ where: { expeditionId: expedition.id } }),
      prisma.user.count(),
      prisma.checkIn.count(),
      prisma.auditEvent.count(),
    ]);

  const overdue = await prisma.mission.count({
    where: { expeditionId: expedition.id, status: "OVERDUE" },
  });

  const medPending = await prisma.personnel.count({
    where: { expeditionId: expedition.id, medicalClearancePending: true },
  });

  const scopes = await prisma.userExpeditionScope.findMany({
    where: { expeditionId: expedition.id },
    include: { user: { select: { email: true, role: true } } },
  });

  const invRows = await listInventoryForExpeditions([expedition.id]);
  const lowOrCritical = invRows.filter((r) => r.stockLevel !== "AVAILABLE");

  console.log("=== POLAR-NEXUS seed verification ===");
  console.log({
    expedition: expedition.code,
    status: expedition.status,
    stations: expedition.stations.map((s) => s.code),
    personnel,
    medPending,
    teams,
    missions,
    overdueMissions: overdue,
    cargo,
    inventory,
    lowOrCriticalSkus: lowOrCritical.map((r) => r.sku),
    assets,
    incidents,
    checkIns,
    auditEvents: audit,
    demoUsers: scopes.map((s) => s.user.email),
    totalUsers: users,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
