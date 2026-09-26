import { loadEnvConfig } from "@next/env";
import { execSync } from "node:child_process";

loadEnvConfig(process.cwd());

execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });