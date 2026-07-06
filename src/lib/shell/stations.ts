import { ShellDesign, Vec3 } from "./types";
import { canReachFrom, L1, L2, BASE_Y, mastFor } from "../robot";
import { localCeiling, CARPORT_STILT_HEIGHT_M } from "./generate";

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

/** does placing this plate from this station clear the shell's local
 *  interior ceiling? A station can be within arm-reach distance of a plate
 *  and still sweep the elbow into the roof — reach alone (stationCanReach)
 *  doesn't check that. Mirrors the elbow-up solveIK shoulder angle (see
 *  RobotArm.tsx) to compute where the elbow joint actually ends up (not
 *  directly above the station — it swings out horizontally toward the
 *  target by `L1·cos(shoulder)`, same as RobotArm.tsx's FK), then checks
 *  that point against the ceiling directly above ITS horizontal position
 *  (not the station's). */
export function stationHasClearance(
  s: Station,
  plateCentroid: Vec3,
  design: ShellDesign
): boolean {
  const config = design.config;
  const isCarport = config.houseType === "shelter";
  const stiltLift = isCarport ? CARPORT_STILT_HEIGHT_M : 0;

  const dx = plateCentroid.x - s.x;
  const dz = plateCentroid.z - s.z;
  const yaw = Math.atan2(dx, dz);
  const horiz = Math.sqrt(dx * dx + dz * dz);
  const mastHeight = mastFor(plateCentroid.y);
  const dy = plateCentroid.y - (mastHeight + BASE_Y);

  let r = Math.sqrt(horiz * horiz + dy * dy);
  r = Math.min(Math.max(r, Math.abs(L1 - L2) + 0.05), L1 + L2 - 0.05);
  const cosAlpha = (L1 * L1 + r * r - L2 * L2) / (2 * L1 * r);
  const alpha = Math.acos(Math.min(1, Math.max(-1, cosAlpha)));
  const shoulder = Math.atan2(dy, horiz) + alpha;
  const elbowY = BASE_Y + mastHeight + L1 * Math.sin(shoulder);

  // elbow's horizontal position: station + L1·cos(shoulder) along the yaw
  // toward the target (matches RobotArm.tsx gripperTip's `d1` term)
  const elbowHoriz = L1 * Math.cos(shoulder);
  const elbowX = s.x + Math.sin(yaw) * elbowHoriz;
  const elbowZ = s.z + Math.cos(yaw) * elbowHoriz;
  const elbowD = Math.hypot(elbowX, elbowZ);

  const ceilingBase = localCeiling(config, elbowD);
  if (ceilingBase === 0) return true; // outside the roofed footprint — open sky
  return elbowY <= ceilingBase + stiltLift;
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

export interface DepotLayout {
  /** where the robot parks to work the depot */
  stand: Station;
  /** pallet mesh position (ground) */
  pallet: Vec3;
  /** arm target when picking a plate */
  pickup: Vec3;
  /** mill mesh position (ground) */
  mill: Vec3;
  /** arm target while milling */
  millPoint: Vec3;
}

/**
 * Material depot placement. Closed shells (office, library) get their depot
 * crane-delivered to the CENTER through the still-open crown; the carport
 * (raised on stilts, open underneath on all sides) is served from a
 * forecourt just outside its footprint — material stays out of the robot's
 * direct path under the canopy, not for collision-avoidance (the stilt
 * elevation already handles that).
 */
export function depotLayout(design: ShellDesign): DepotLayout {
  if (design.config.houseType === "shelter") {
    const r = design.config.radius;
    const zf = r + 2.2;
    return {
      stand: { x: 0, z: r + 1.6 },
      pallet: { x: 1.0, y: 0, z: zf },
      pickup: { x: 1.0, y: 0.75, z: zf },
      mill: { x: -1.2, y: 0, z: zf },
      millPoint: { x: -1.2, y: 0.85, z: zf },
    };
  }
  return {
    stand: { x: 0, z: 0 },
    pallet: { x: 1.25, y: 0, z: 0.45 },
    pickup: { x: 1.25, y: 0.75, z: 0.45 },
    mill: { x: 1.15, y: 0, z: -1.0 },
    millPoint: { x: 1.15, y: 0.85, z: -1.0 },
  };
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
