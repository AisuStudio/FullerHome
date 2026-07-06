"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RobotArm, { RobotArmHandle, RobotPose, HOME_POSE, TUCK_POSE, solveIK } from "./RobotArm";
import { useSimStore } from "@/lib/store";
import { Plate } from "@/lib/shell/types";
import { computeStations, stationForPlate, Station } from "@/lib/shell/stations";
import { mastFor } from "@/lib/robot";

// ---------------------------------------------------------------------------
// Drives the whole build. The realistically sized robot can't reach the whole
// shell from one spot, so it REPOSITIONS: material depot + CNC mill sit at
// the center of the footprint (crane-delivered through the open crown before
// shell work starts); per plate the robot drives depot → mill → the work
// station nearest the target, places, and returns. All hot-path values live
// in refs; the store only receives discrete "plate placed" events.
// ---------------------------------------------------------------------------

// depot equipment around the central stand (station[0] is always {0,0})
export const PALLET_POS = new THREE.Vector3(1.25, 0, 0.45);
export const MILL_POS = new THREE.Vector3(1.15, 0, -1.0);
const PICKUP_POINT = new THREE.Vector3(1.25, 0.75, 0.45);
const MILL_POINT = new THREE.Vector3(1.15, 0.85, -1.0);

/** ground speed while repositioning, m/s (scaled by sim speed) */
const DRIVE_SPEED = 1.2;

/** arm raised forward so the carried plate clears the ground while driving */
const CARRY_POSE: RobotPose = { yaw: 0, mastHeight: 2.0, shoulder: 0.7, elbow: -1.5 };

type SubPhase =
  | "toDepot" // drive to the central depot stand
  | "reachPallet"
  | "grab"
  | "toMill"
  | "mill"
  | "carryUp" // lift plate into travel pose
  | "toStation" // drive to the placement station
  | "toTarget"
  | "place"
  | "retract";

const DURATIONS: Record<SubPhase, number> = {
  toDepot: 0, // drives use distance/DRIVE_SPEED instead
  reachPallet: 0.8,
  grab: 0.35,
  toMill: 0.7,
  mill: 0.9,
  carryUp: 0.6,
  toStation: 0,
  toTarget: 0.9,
  place: 0.45,
  retract: 0.5,
};

const NEXT: Record<SubPhase, SubPhase> = {
  toDepot: "reachPallet",
  reachPallet: "grab",
  grab: "toMill",
  toMill: "mill",
  mill: "carryUp",
  carryUp: "toStation",
  toStation: "toTarget",
  toTarget: "place",
  place: "retract",
  retract: "toDepot",
};

const isDrive = (s: SubPhase) => s === "toDepot" || s === "toStation";

const easeInOut = (t: number) => t * t * (3 - 2 * t);

/** IK toward a WORLD target from a base at basePos with heading baseYaw */
function poseFor(target: THREE.Vector3, basePos: THREE.Vector3, baseYaw: number): RobotPose {
  const rel = new THREE.Vector3(target.x - basePos.x, target.y, target.z - basePos.z);
  const pose = solveIK(rel, mastFor(target.y));
  return { ...pose, yaw: pose.yaw - baseYaw };
}

function lerpPose(a: RobotPose, b: RobotPose, t: number): RobotPose {
  // shortest-path yaw interpolation
  let dyaw = b.yaw - a.yaw;
  while (dyaw > Math.PI) dyaw -= Math.PI * 2;
  while (dyaw < -Math.PI) dyaw += Math.PI * 2;
  return {
    yaw: a.yaw + dyaw * t,
    mastHeight: a.mastHeight + (b.mastHeight - a.mastHeight) * t,
    shoulder: a.shoulder + (b.shoulder - a.shoulder) * t,
    elbow: a.elbow + (b.elbow - a.elbow) * t,
  };
}

const lerpAngle = (a: number, b: number, t: number) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

interface CarriedPlateProps {
  plate: Plate;
  groupRef: React.RefObject<THREE.Group | null>;
}

/** the plate currently in transit, transformed by the sequencer */
function CarriedPlate({ plate, groupRef }: CarriedPlateProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const c = plate.centroid;
    const positions: number[] = [];
    for (let i = 0; i < plate.vertices.length; i++) {
      const a = plate.vertices[i];
      const b = plate.vertices[(i + 1) % plate.vertices.length];
      positions.push(c.x, c.y, c.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    return geo;
  }, [plate]);

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} castShadow>
        {plate.material === "glass" ? (
          <meshPhysicalMaterial color="#bcd8e8" transparent opacity={0.45} roughness={0.05} side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial color="#B08D57" roughness={0.75} side={THREE.DoubleSide} />
        )}
      </mesh>
    </group>
  );
}

export default function BuildSimulation() {
  const robotRef = useRef<RobotArmHandle>(null);
  const carriedRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Group>(null);

  const phase = useSimStore((s) => s.phase);
  const steps = useSimStore((s) => s.steps);
  const cursor = useSimStore((s) => s.cursor);
  const design = useSimStore((s) => s.design);

  const stations = useMemo(() => computeStations(design), [design]);

  // exit path: the tracked robot drives out through the door opening
  const doorDir = useMemo(() => {
    const doorPlate = design.plates.find((p) => p.isDoor);
    if (!doorPlate) return new THREE.Vector3(0, 0, 1);
    const c = doorPlate.centroid;
    return new THREE.Vector3(c.x, 0, c.z).normalize();
  }, [design]);

  const sub = useRef<SubPhase>("toDepot");
  const t = useRef(0);
  const fromPose = useRef<RobotPose>({ ...HOME_POSE });
  const currentPose = useRef<RobotPose>({ ...HOME_POSE });

  // base (tracked chassis) state
  const basePos = useRef(new THREE.Vector3(0, 0, 0));
  const baseYaw = useRef(0);
  const driveFrom = useRef(new THREE.Vector3());
  const driveTo = useRef(new THREE.Vector3());
  const driveDur = useRef(1);
  const exitDist = useRef(0);

  const currentPlate: Plate | null =
    phase === "building" && cursor < steps.length
      ? design.plates[steps[cursor].plateId]
      : null;

  const applyBase = () => {
    if (!baseRef.current) return;
    baseRef.current.position.copy(basePos.current);
    baseRef.current.rotation.y = baseYaw.current;
  };

  const startDrive = (dest: THREE.Vector3) => {
    driveFrom.current.copy(basePos.current);
    driveTo.current.copy(dest);
    const dist = driveFrom.current.distanceTo(driveTo.current);
    driveDur.current = Math.max(0.25, dist / DRIVE_SPEED);
  };

  useFrame((_, dt) => {
    const { speed, paused, placeNext } = useSimStore.getState();
    const robot = robotRef.current;
    if (!robot) return;

    if (phase !== "building" || !currentPlate || paused) {
      if (phase === "done") {
        // fold flat, then drive out through the door opening
        currentPose.current = lerpPose(currentPose.current, TUCK_POSE, Math.min(1, dt * 1.5));
        const folded =
          Math.abs(currentPose.current.shoulder - TUCK_POSE.shoulder) < 0.08 &&
          Math.abs(currentPose.current.elbow - TUCK_POSE.elbow) < 0.12;

        const maxExit = design.config.radius + 2.5;
        if (folded && exitDist.current < maxExit) {
          exitDist.current = Math.min(maxExit, exitDist.current + dt * DRIVE_SPEED * 0.6);
          const p = doorDir.clone().multiplyScalar(exitDist.current);
          basePos.current.set(p.x, 0, p.z);
          baseYaw.current = Math.atan2(doorDir.x, doorDir.z);
          if (exitDist.current >= maxExit) {
            // robot is out — the door element gets installed behind it
            useSimStore.getState().setExitDone();
          }
        }
      } else if (phase === "planning" && exitDist.current !== 0) {
        exitDist.current = 0;
        basePos.current.set(0, 0, 0);
        baseYaw.current = 0;
        sub.current = "toDepot";
        t.current = 0;
      }
      applyBase();
      robot.setPose(currentPose.current);
      if (carriedRef.current) carriedRef.current.visible = false;
      return;
    }

    const targetCentroid = new THREE.Vector3(
      currentPlate.centroid.x,
      currentPlate.centroid.y,
      currentPlate.centroid.z
    );
    const station: Station = stationForPlate(stations, currentPlate.centroid);

    // set up drive segments when entering a drive phase (t === 0)
    if (isDrive(sub.current) && t.current === 0) {
      const dest =
        sub.current === "toDepot"
          ? new THREE.Vector3(0, 0, 0)
          : new THREE.Vector3(station.x, 0, station.z);
      startDrive(dest);
    }

    const duration = isDrive(sub.current) ? driveDur.current : DURATIONS[sub.current];
    t.current += (dt * speed) / duration;
    const k = easeInOut(Math.min(1, t.current));

    if (isDrive(sub.current)) {
      // chassis moves; arm folds into travel pose (tucked, or raised carry)
      basePos.current.lerpVectors(driveFrom.current, driveTo.current, k);
      const travel = driveTo.current.clone().sub(driveFrom.current);
      if (travel.lengthSq() > 0.001) {
        baseYaw.current = lerpAngle(
          baseYaw.current,
          Math.atan2(travel.x, travel.z),
          Math.min(1, dt * speed * 3)
        );
      }
      const travelPose = sub.current === "toStation" ? CARRY_POSE : TUCK_POSE;
      currentPose.current = lerpPose(currentPose.current, travelPose, Math.min(1, dt * speed * 2));
    } else {
      const targetPose: Record<Exclude<SubPhase, "toDepot" | "toStation">, RobotPose> = {
        reachPallet: poseFor(PICKUP_POINT, basePos.current, baseYaw.current),
        grab: poseFor(PICKUP_POINT.clone().setY(0.45), basePos.current, baseYaw.current),
        toMill: poseFor(MILL_POINT, basePos.current, baseYaw.current),
        mill: poseFor(MILL_POINT.clone().setY(0.7), basePos.current, baseYaw.current),
        carryUp: CARRY_POSE,
        toTarget: poseFor(
          targetCentroid.clone().sub(
            targetCentroid
              .clone()
              .setY(0)
              .sub(new THREE.Vector3(station.x, 0, station.z))
              .normalize()
              .multiplyScalar(0.4)
          ),
          basePos.current,
          baseYaw.current
        ),
        place: poseFor(targetCentroid, basePos.current, baseYaw.current),
        retract: CARRY_POSE,
      };
      currentPose.current = lerpPose(
        fromPose.current,
        targetPose[sub.current as Exclude<SubPhase, "toDepot" | "toStation">],
        k
      );
    }

    applyBase();
    robot.setPose(currentPose.current);

    // carried plate follows the gripper from grab through milling to placement
    const carrying =
      sub.current === "toMill" ||
      sub.current === "mill" ||
      sub.current === "carryUp" ||
      sub.current === "toStation" ||
      sub.current === "toTarget" ||
      sub.current === "place";
    if (carriedRef.current) {
      carriedRef.current.visible = carrying;
      if (carrying) {
        // gripper tip in WORLD space: local FK, rotated by base yaw, offset by base pos
        const tipLocal = robot.gripperTip(currentPose.current);
        const tip = tipLocal
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), baseYaw.current)
          .add(basePos.current);
        // plate geometry is in world space at its FINAL position; offset it so
        // its centroid rides on the gripper tip, easing to zero as we place
        const settle = sub.current === "place" ? k : 0;
        const offset = tip.sub(targetCentroid).multiplyScalar(1 - settle);
        // milling vibration
        if (sub.current === "mill") {
          offset.x += Math.sin(t.current * 80) * 0.012;
          offset.z += Math.cos(t.current * 95) * 0.012;
        }
        carriedRef.current.position.copy(offset);
      }
    }

    if (t.current >= 1) {
      if (sub.current === "place") {
        placeNext(); // store: cursor++, ShellStructure shows the plate
      }
      fromPose.current = { ...currentPose.current };
      sub.current = NEXT[sub.current];
      t.current = 0;
    }
  });

  return (
    <>
      <group ref={baseRef}>
        <RobotArm ref={robotRef} />
      </group>
      {currentPlate && <CarriedPlate plate={currentPlate} groupRef={carriedRef} />}
    </>
  );
}
