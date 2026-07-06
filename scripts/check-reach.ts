import { generateShell, computeCosts, configForBudget, TYPE_BUDGET, buildingDims } from "../src/lib/shell/generate";
import { computeStations, stationCanReach, MAX_STATIONS } from "../src/lib/shell/stations";
import { HouseType } from "../src/lib/shell/types";

// Station-based coverage check: every plate must be placeable from at least
// one work station (the robot drives between stations — see stations.ts).
// Uses the same kinematics as the scene via src/lib/robot.ts.

let anyFail = false;
for (const t of ["shelter", "office", "library"] as HouseType[]) {
  const { min, max } = TYPE_BUDGET[t];
  for (const budget of [min, Math.round((min + max) / 2), max]) {
    const design = generateShell(configForBudget(budget, t));
    const costs = computeCosts(design);
    const dims = buildingDims(design);
    const stations = computeStations(design);

    const uncovered = design.plates.filter(
      (p) => !stations.some((s) => stationCanReach(s, p.centroid))
    );

    const ok = uncovered.length === 0 && stations.length <= MAX_STATIONS;
    if (!ok) anyFail = true;
    console.log(
      `${t.padEnd(8)} budget=${String(budget).padStart(9)} r=${design.config.radius} ` +
        `dims=${dims.widthM}×${dims.lengthM}×${dims.heightM}m area=${String(costs.floorAreaM2).padStart(4)}m² ` +
        `stations=${stations.length} uncovered=${uncovered.length} ok=${ok}`
    );
    if (uncovered.length > 0) {
      for (const p of uncovered.slice(0, 3)) {
        console.log(`    unreachable plate ${p.id} at`, p.centroid);
      }
    }
  }
}

if (anyFail) {
  console.error("REACH/COVERAGE CHECK FAILED");
  process.exit(1);
}
console.log("all station-coverage checks passed");
