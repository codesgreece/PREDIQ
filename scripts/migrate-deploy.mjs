/**
 * Run `prisma migrate deploy` against the direct (non-pooled) Neon URL when available.
 * Pooled PgBouncer connections cannot acquire Prisma advisory locks reliably.
 */
import { spawnSync } from "node:child_process";

const direct =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!direct) {
  console.error("No DATABASE_URL / DATABASE_URL_UNPOOLED configured for migrate deploy.");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy"],
  {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: direct },
    shell: true,
  },
);

process.exit(result.status ?? 1);
