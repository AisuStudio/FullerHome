// ---------------------------------------------------------------------------
// Robot kinematic constants + reach formula — pure module (no three.js, no
// React) so the scene components, the station planner and the node check
// scripts all share one source of truth.
//
// Sized realistically after the ETH In-situ Fabricator (~1.4×0.8m footprint,
// 2.55m arm reach), with two declared concept extensions: a slightly longer
// arm for the heavier plates and a telescoping vertical lift column.
// ---------------------------------------------------------------------------

/** upper arm length (m) */
export const L1 = 1.9;
/** forearm length (m) */
export const L2 = 1.7;
/** height of the slew ring above ground (tracks + body) */
export const BASE_Y = 0.62;

/** vertical lift column travel */
export const MAST_MIN = 0.8;
export const MAST_MAX = 3.4;

/** practical max arm extension (slightly inside the singularity) */
export const MAX_ARM_R = L1 + L2 - 0.05;

/** mast height the controller picks for a target at height y (see poseFor) */
export function mastFor(targetY: number): number {
  return Math.min(MAST_MAX, Math.max(MAST_MIN, targetY * 0.6));
}

/** required arm extension to reach a world target from a base at `base` (ground) */
export function armReachFrom(
  baseX: number,
  baseZ: number,
  targetX: number,
  targetY: number,
  targetZ: number
): number {
  const dx = targetX - baseX;
  const dz = targetZ - baseZ;
  const d = Math.sqrt(dx * dx + dz * dz);
  const dy = targetY - (mastFor(targetY) + BASE_Y);
  return Math.sqrt(d * d + dy * dy);
}

/** can the robot, standing at (baseX, baseZ), place a plate centered at the target? */
export function canReachFrom(
  baseX: number,
  baseZ: number,
  targetX: number,
  targetY: number,
  targetZ: number
): boolean {
  return armReachFrom(baseX, baseZ, targetX, targetY, targetZ) <= MAX_ARM_R;
}
