import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

/**
 * Runs on Vercel during `vercel-build`: apply schema and seed demo users when empty.
 */
async function main() {
  if (!process.env.DATABASE_URL?.startsWith("postgres")) {
    console.error(
      "[vercel-prebuild] DATABASE_URL must be a PostgreSQL URL (use Neon from Vercel Storage or neon.tech)."
    );
    process.exit(1);
  }

  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });

  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("[vercel-prebuild] Empty database — running seed…");
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[vercel-prebuild] failed:", err);
  process.exit(1);
});
