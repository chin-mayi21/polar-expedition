import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

/**
 * Render / production: apply schema and seed demo data when the DB is empty.
 * Safe to run on every start (seed runs only when there are no users).
 */
async function main() {
  execSync("node scripts/sync-prisma-provider.mjs", { stdio: "inherit" });
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });

  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("[ensure-database] Empty database — running seed…");
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
    } else {
      console.log(`[ensure-database] ${userCount} user(s) present — skipping seed.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[ensure-database] failed:", err);
  process.exit(1);
});
