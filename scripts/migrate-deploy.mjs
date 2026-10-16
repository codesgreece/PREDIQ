/**
 * Apply pending Prisma migrations for Vercel / Neon.
 *
 * Uses the direct (non-pooled) URL when available. If every local migration
 * folder is already recorded in `_prisma_migrations`, skip `migrate deploy`
 * entirely — that command always takes an advisory lock, and stuck serverless
 * connections on Neon can block subsequent builds for minutes.
 */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const direct =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!direct) {
  console.error("No DATABASE_URL / DATABASE_URL_UNPOOLED configured for migrate deploy.");
  process.exit(1);
}

const migrationsDir = join(process.cwd(), "prisma", "migrations");
const localMigrations = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

async function alreadyApplied() {
  const client = new pg.Client({
    connectionString: direct,
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`,
    );
    const applied = new Set(rows.map((r) => r.migration_name));
    return localMigrations.every((name) => applied.has(name));
  } catch (err) {
    console.warn("Could not pre-check migrations; falling back to prisma migrate deploy.");
    console.warn(String(err?.message || err));
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

if (await alreadyApplied()) {
  console.log(`All ${localMigrations.length} migration(s) already applied — skipping migrate deploy.`);
  process.exit(0);
}

console.log("Pending migrations detected — running prisma migrate deploy via direct URL…");
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: direct,
    DATABASE_URL_UNPOOLED: direct,
  },
  shell: true,
});

process.exit(result.status ?? 1);
