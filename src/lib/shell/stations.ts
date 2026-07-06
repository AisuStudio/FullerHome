import { ShellDesign, Vec3 } from "./types";
import { canReachFrom } from "../robot";

// ---------------------------------------------------------------------------
// Work-station planner for the repositioning robot. The realistically sized
// arm (~3.5m reach incl. mast compensation) can't cover a whole building from
// one spot, so the robot drives between a small set of ground stations inside
// the footprint — like the real In-situ Fabricator, which "reaches height by
// repositioning". Pure + deterministic; shared with scripts/check-reach.ts.
// ---------------------------------------------------------------------------

export const MAX_STATIONS = 8;
/** how far a station is pulled inward from an unreachable plate's footprint */
const PULL_IN_M = 1.5;

/** ground position (y = 0) the robot parks at while placing nearby plates */
export type Station = { x: number; z: number };

export function stationCanReach(s: Station, plateCentroid: Vec3): boolean {
  return canReachFrom(s.x, s.z, plateCentroid.x, plateCentroid.y, plateCentroid.z);
}

/**
 * Greedy set-cover: start at the center; while any plate is unreachable from
 * every station, add a station at the ground projection of the FARTHEST
 * unreachable plate, pulled PULL_IN_M toward the center. Deterministic for a
 * given design; works for any plan shape (round, elongated, twin-lobe).
 */
export function computeStations(design: ShellDesign): Station[] {
  const stations: Station[] = [{ x: 0, z: 0 }];

  const unreachable = () =>
    design.plates.filter((p) => !stations.some((s) => stationCanReach(s, p.centroid)));

  for (let guard = 0; guard < MAX_STATIONS - 1; guard++) {
    const missing = unreachable();
    if (missing.length === 0) break;

    // farthest-from-any-station unreachable plate
    let worst = missing[0];
    let worstDist = -1;
    for (const p of missing) {
      const d = Math.min(
        ...stations.map((s) => Math.hypot(p.centroid.x - s.x, p.centroid.z - s.z))
      );
      if (d > worstDist) {
        worstDist = d;
        worst = p;
      }
    }

    const gx = worst.centroid.x;
    const gz = worst.centroid.z;
    const len = Math.hypot(gx, gz) || 1;
    const pull = Math.min(PULL_IN_M, len * 0.9); // never overshoot past center
    stations.push({
      x: Math.round((gx - (gx / len) * pull) * 100) / 100,
      z: Math.round((gz - (gz / len) * pull) * 100) / 100,
    });
  }

  return stations;
}

/** the station closest to a plate AMONG those that can actually reach it
 * (falls back to nearest overall — sequencing still works, arm just clamps) */
export function stationForPlate(stations: Station[], plateCentroid: Vec3): Station {
  const reaching = stations.filter((s) => stationCanReach(s, plateCentroid));
  const pool = reaching.length > 0 ? reaching : stations;
  return pool.reduce((best, s) =>
    Math.hypot(plateCentroid.x - s.x, plateCentroid.z - s.z) <
    Math.hypot(plateCentroid.x - best.x, plateCentroid.z - best.z)
      ? s
      : best
  );
}
