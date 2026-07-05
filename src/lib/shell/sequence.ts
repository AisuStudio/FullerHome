import { BuildStep, ShellDesign } from "./types";

// ---------------------------------------------------------------------------
// Bottom-up, connectivity-constrained build order.
// Invariant: every placed plate is on ring 0 (foundation-anchored) or shares
// an edge with an already-placed plate — no floating plates, ever.
// ---------------------------------------------------------------------------

export function sequenceBuild(design: ShellDesign): BuildStep[] {
  const { plates } = design;
  const placed = new Set<number>();
  // the door plate stays open as the robot's exit passage — it gets installed
  // from outside after the robot has left the building
  const remaining = new Set<number>(
    plates.filter((p) => !p.isDoor).map((p) => p.id)
  );
  const steps: BuildStep[] = [];

  const angleOf = (id: number) => {
    const c = plates[id].centroid;
    return Math.atan2(c.x, c.z);
  };

  while (remaining.size > 0) {
    let best: number | null = null;

    for (const id of remaining) {
      const p = plates[id];
      const anchored =
        p.ring === 0 || p.neighbors.some((n) => placed.has(n));
      if (!anchored) continue;

      if (best === null) {
        best = id;
        continue;
      }
      const b = plates[best];
      // lowest ring first; within a ring sweep around the Y axis
      if (
        p.ring < b.ring ||
        (p.ring === b.ring && angleOf(id) < angleOf(best))
      ) {
        best = id;
      }
    }

    if (best === null) {
      // disconnected component (shouldn't happen on a shell) — bail gracefully
      break;
    }

    placed.add(best);
    remaining.delete(best);
    steps.push({ plateId: best, ring: plates[best].ring, order: steps.length });
  }

  return steps;
}

/** sanity checks — returns a list of violations (empty = all good) */
export function validateSequence(design: ShellDesign, steps: BuildStep[]): string[] {
  const { plates } = design;
  const errors: string[] = [];
  const placed = new Set<number>();

  const buildable = plates.filter((p) => !p.isDoor).length;
  if (steps.length !== buildable) {
    errors.push(`step count ${steps.length} != buildable plates ${buildable}`);
  }

  let maxRingSeen = 0;
  for (const step of steps) {
    const p = plates[step.plateId];
    const anchored = p.ring === 0 || p.neighbors.some((n) => placed.has(n));
    if (!anchored) {
      errors.push(`plate ${p.id} (ring ${p.ring}) placed without anchor at step ${step.order}`);
    }
    if (p.ring > maxRingSeen + 1) {
      errors.push(`ring jump: plate ${p.id} ring ${p.ring} after max ${maxRingSeen}`);
    }
    maxRingSeen = Math.max(maxRingSeen, p.ring);
    placed.add(p.id);
  }

  return errors;
}
