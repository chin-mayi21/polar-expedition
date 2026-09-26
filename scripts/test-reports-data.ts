import { PrismaClient } from "@prisma/client";
import { explainExpeditionReadiness } from "../src/lib/expedition/readiness-explained";
import { listAuditEvents } from "../src/lib/reports/audit-queries";
import { fetchOpsSummary } from "../src/lib/reports/ops-summary";

const prisma = new PrismaClient();

async function main() {
  const exp = await prisma.expedition.findFirst();
  if (!exp) throw new Error("no expedition");
  const ids = [exp.id];
  await explainExpeditionReadiness(exp.id);
  await listAuditEvents(ids, { take: 5 });
  await fetchOpsSummary(ids);
  console.log("reports data ok", exp.code);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
