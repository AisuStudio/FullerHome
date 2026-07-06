import { generateShell } from "../src/lib/shell/generate";
import { sequenceBuild, validateSequence } from "../src/lib/shell/sequence";

for (const detail of [1, 2, 3]) {
  const design = generateShell({ detail });
  const steps = sequenceBuild(design);
  const errors = validateSequence(design, steps);

  const doorCount = design.plates.filter((p) => p.isDoor).length;
  console.log(
    `detail=${detail}: ${design.plates.length} plates, ${design.rings} rings, ` +
      `${design.bom.woodPlates} wood / ${design.bom.glassPlates} glass, ` +
      `door=${doorCount}, weight=${design.bom.totalWeightKg}kg, steps=${steps.length}`
  );

  if (errors.length > 0) {
    console.error(`  FAIL:\n  ${errors.slice(0, 10).join("\n  ")}`);
    process.exit(1);
  }

  // extra: neighbors are symmetric
  for (const p of design.plates) {
    for (const n of p.neighbors) {
      if (!design.plates[n].neighbors.includes(p.id)) {
        console.error(`  FAIL: asymmetric neighbor ${p.id} <-> ${n}`);
        process.exit(1);
      }
    }
  }

  // extra: polygons are sane
  for (const p of design.plates) {
    if (p.vertices.length < 3) {
      console.error(`  FAIL: plate ${p.id} has ${p.vertices.length} vertices`);
      process.exit(1);
    }
  }

  console.log("  OK");
}

console.log("all checks passed");

// house types
for (const houseType of ["shelter", "office", "library"] as const) {
  const d = generateShell({ houseType, ...(houseType === "library" ? { cutRatio: -0.32 } : {}) });
  const s = sequenceBuild(d);
  const errs = validateSequence(d, s);
  console.log(`type=${houseType}: ${d.plates.length} plates, rings=${d.rings}, glassFront=${!!d.glassFront}, slab=${d.floorSlabY ?? "-"}`);
  if (errs.length) { console.error(`  FAIL: ${errs.slice(0,5).join("; ")}`); process.exit(1); }
  console.log("  OK");
}
