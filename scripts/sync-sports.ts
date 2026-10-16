import { syncSportsCatalog } from "../src/lib/sports-data/sync";

async function main() {
  const max = process.env.SYNC_MAX_COMPETITIONS
    ? Number(process.env.SYNC_MAX_COMPETITIONS)
    : undefined;
  const result = await syncSportsCatalog({
    adapterKey: "api-football",
    maxCompetitions: Number.isFinite(max) ? max : undefined,
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.status === "FAILED") process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
