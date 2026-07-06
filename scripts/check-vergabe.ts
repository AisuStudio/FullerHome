import { bandForNetBudget, VERGABE_BANDS } from "../src/lib/vergabe/bands";
import { deriveVergabe, grossBudgetToNetConstructionValue } from "../src/lib/vergabe/derive";
import { LAND_OBLIGATIONS } from "../src/lib/vergabe/obligations";

let failures = 0;
const check = (label: string, cond: boolean) => {
  if (!cond) {
    console.error(`  FAIL: ${label}`);
    failures++;
  }
};

// --- band edges, exact net values ---
console.log("Band edges (net budgets):");
const edges: [number, string][] = [
  [49_999, "direktauftrag"],
  [50_000, "direktauftrag"],
  [50_001, "freihaendig"],
  [99_999, "freihaendig"],
  [100_000, "freihaendig"],
  [100_001, "beschraenkt"],
  [149_999, "beschraenkt"],
  [150_000, "beschraenkt"],
  [150_001, "oeffentlich"],
  [5_403_999, "oeffentlich"],
  [5_404_000, "oeffentlich"],
  [5_404_001, "euweit"],
  [50_000_000, "euweit"],
];

for (const [net, expected] of edges) {
  const band = bandForNetBudget(net);
  const ok = band.id === expected;
  console.log(`  net=${net} -> ${band.id} (expected ${expected}) ${ok ? "OK" : "FAIL"}`);
  check(`net=${net} should be ${expected}, got ${band.id}`, ok);
}

// --- band list sanity ---
check("5 bands defined", VERGABE_BANDS.length === 5);
check(
  "bands are strictly increasing by upToNet",
  VERGABE_BANDS.every((b, i) => i === 0 || b.upToNet > VERGABE_BANDS[i - 1].upToNet)
);
check("last band is unbounded", VERGABE_BANDS[VERGABE_BANDS.length - 1].upToNet === Infinity);
for (const b of VERGABE_BANDS) {
  check(`band ${b.id} has a reference`, b.reference.length > 0);
  check(`band ${b.id} has a duration range`, b.durationRange.length > 0);
}

// --- gross -> net conversion ---
console.log("\nGross -> net conversion:");
const net100k = grossBudgetToNetConstructionValue(100_000);
console.log(`  gross €100,000 -> net €${net100k}`);
check("net value is less than gross (VAT + planning share removed)", net100k < 100_000);
check("net value is positive", net100k > 0);

// --- deriveVergabe end to end, both Länder ---
console.log("\nderiveVergabe (both Länder):");
for (const land of ["berlin", "brandenburg"] as const) {
  for (const gross of [40_000, 300_000, 3_000_000, 8_000_000]) {
    const result = deriveVergabe(gross, land);
    console.log(
      `  ${land} gross=${gross} -> net=${result.budgetNet} band=${result.band.id} obligations=${result.landObligation.points.length}`
    );
    check(`${land}/${gross}: obligation act name set`, result.landObligation.actName.length > 0);
    check(`${land}/${gross}: 2-4 obligation points`, result.landObligation.points.length >= 2 && result.landObligation.points.length <= 4);
    check(`${land}/${gross}: band matches direct lookup`, result.band.id === bandForNetBudget(result.budgetNet).id);
  }
}

// --- both Länder present ---
check("berlin obligations defined", !!LAND_OBLIGATIONS.berlin);
check("brandenburg obligations defined", !!LAND_OBLIGATIONS.brandenburg);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nall vergabe checks passed");
