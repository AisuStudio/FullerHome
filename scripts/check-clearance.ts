import { generateShell, configForBudget, TYPE_BUDGET, buildingDims } from "../src/lib/shell/generate";
import { computeStations, stationForPlate, stationHasClearance } from "../src/lib/shell/stations";
import { HouseType } from "../src/lib/shell/types";

// Ceiling-clearance check: for the station the robot actually drives to for
// each plate (stationForPlate — same selection BuildSimulation.tsx uses),
// the arm's elbow-up reach pose must not sweep above the shell's local
// interior ceiling at that station. Being in ARM-REACH of a plate
// (check-reach.ts) is necessary but not sufficient — a station can be close
// enough to a target while still poking the elbow through the roof.

let anyFail = false;
for (const t of ["shelter", "office", "library"] as HouseType[]) {
  const { min, max } = TYPE_BUDGET[t];
  for (const budget of [min, Math.round((min + max) / 2), max]) {
    const design = generateShell(configForBudget(budget, t));
    const dims = buildingDims(design);
    const stations = computeStations(design);

    const violations = design.plates.filter((p) => {
      const station = stationForPlate(stations, p.centroid);
      return !stationHasClearance(station, p.centroid, design);
    });

    const ok = violations.length === 0;
    if (!ok) anyFail = true;
    console.log(
      `${t.padEnd(8)} budget=${String(budget).padStart(9)} r=${design.config.radius} ` +
        `dims=${dims.widthM}×${dims.lengthM}×${dims.heightM}m ` +
        `stations=${stations.length} violations=${violations.length} ok=${ok}`
    );
    if (violations.length > 0) {
      for (const p of violations.slice(0, 3)) {
        console.log(`    clearance violation: plate ${p.id} (ring ${p.ring}) at`, p.centroid);
      }
    }
  }
}

if (anyFail) {
  console.error("CLEARANCE CHECK FAILED");
  process.exit(1);
}
console.log("all clearance checks passed");
