"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import RobotArm, { RobotArmHandle, RobotPose, HOME_POSE, EXIT_POSE, solveIK } from "./RobotArm";
import { useSimStore } from "@/lib/store";
import { Plate } from "@/lib/shell/types";

// ---------------------------------------------------------------------------
// Drives the whole build: a time-parameterized state machine inside useFrame.
// Per-plate script: swing to pallet → grab → swing to target → place → retract.
// All hot-path values live in refs; the store only receives discrete
// "plate placed" events.
// ---------------------------------------------------------------------------

// both stations must be inside the arm's reach (L1+L2 ≈ 6.6m)
export const PALLET_POS = new THREE.Vector3(-5.4, 0, 1.8);
export const MILL_POS = new THREE.Vector3(-4.6, 0, -3.2);
const PICKUP_POINT = new THREE.Vector3(-5.4, 1.0, 1.8);
const MILL_POINT = new THREE.Vector3(-4.6, 1.15, -3.2);

type SubPhase = "toPallet" | "grab" | "toMill" | "mill" | "toTarget" | "place" | "retract";

const DURATIONS: Record<SubPhase, number> = {
  toPallet: 1.0,
  grab: 0.35,
  toMill: 0.8,
  mill: 0.9,
  toTarget: 1.2,
  place: 0.45,
  retract: 0.5,
};

const NEXT: Record<SubPhase, SubPhase> = {
  toPallet: "grab",
  grab: "toMill",
  toMill: "mill",
  mill: "toTarget",
  toTarget: "place",
  place: "retract",
  retract: "toPallet",
};

const easeInOut = (t: number) => t * t * (3 - 2 * t);

function poseFor(target: THREE.Vector3, minMast: number): RobotPose {
  // mast rises only for high targets, most of the reach comes from the arm
  const mastHeight = Math.max(minMast, target.y * 0.45);
  return solveIK(target, mastHeight);
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

  // exit path: the tracked robot drives out through the door opening
  const doorDir = useMemo(() => {
    const doorPlate = design.plates.find((p) => p.isDoor);
    if (!doorPlate) return new THREE.Vector3(0, 0, 1);
    const c = doorPlate.centroid;
    return new THREE.Vector3(c.x, 0, c.z).normalize();
  }, [design]);
  const exitDist = useRef(0);

  const sub = useRef<SubPhase>("toPallet");
  const t = useRef(0);
  const fromPose = useRef<RobotPose>({ ...HOME_POSE });
  const currentPose = useRef<RobotPose>({ ...HOME_POSE });
  const highestY = useRef(0);

  const currentPlate: Plate | null =
    phase === "building" && cursor < steps.length
      ? design.plates[steps[cursor].plateId]
      : null;

  useFrame((_, dt) => {
    const { speed, paused, placeNext } = useSimStore.getState();
    const robot = robotRef.current;
    if (!robot) return;

    if (phase !== "building" || !currentPlate || paused) {
      // park at home, then slowly ride the rail out through the door
      if (phase === "done") {
        // fold flat first — the door opening is only ~2m tall
        currentPose.current = lerpPose(currentPose.current, EXIT_POSE, Math.min(1, dt * 1.5));
        const folded =
          Math.abs(currentPose.current.mastHeight - EXIT_POSE.mastHeight) < 0.08 &&
          Math.abs(currentPose.current.shoulder - EXIT_POSE.shoulder) < 0.08 &&
          Math.abs(currentPose.current.elbow - EXIT_POSE.elbow) < 0.12;

        const maxExit = design.config.radius + 2.5;
        if (baseRef.current) baseRef.current.rotation.y = Math.atan2(doorDir.x, doorDir.z);
        if (folded && exitDist.current < maxExit) {
          exitDist.current = Math.min(maxExit, exitDist.current + dt * 0.5);
          baseRef.current?.position.copy(doorDir.clone().multiplyScalar(exitDist.current));
          if (exitDist.current >= maxExit) {
            // robot is out — the door element gets installed behind it
            useSimStore.getState().setExitDone();
          }
        }
      } else if (phase === "planning" && exitDist.current !== 0) {
        exitDist.current = 0;
        baseRef.current?.position.set(0, 0, 0);
        if (baseRef.current) baseRef.current.rotation.y = 0;
      }
      robot.setPose(currentPose.current);
      if (carriedRef.current) carriedRef.current.visible = false;
      return;
    }

    const minMast = Math.max(1.6, highestY.current * 0.4);
    const targetCentroid = new THREE.Vector3(
      currentPlate.centroid.x,
      currentPlate.centroid.y,
      currentPlate.centroid.z
    );

    const targetPose: Record<SubPhase, RobotPose> = {
      toPallet: poseFor(PICKUP_POINT, minMast),
      grab: poseFor(PICKUP_POINT.clone().setY(0.55), minMast),
      toMill: poseFor(MILL_POINT, minMast),
      mill: poseFor(MILL_POINT.clone().setY(0.95), minMast),
      toTarget: poseFor(targetCentroid.clone().multiplyScalar(0.92), minMast),
      place: poseFor(targetCentroid, minMast),
      retract: poseFor(targetCentroid.clone().multiplyScalar(0.7), minMast),
    };

    t.current += (dt * speed) / DURATIONS[sub.current];
    const k = easeInOut(Math.min(1, t.current));
    currentPose.current = lerpPose(fromPose.current, targetPose[sub.current], k);
    robot.setPose(currentPose.current);

    // carried plate follows the gripper from grab through milling to placement
    const carrying =
      sub.current === "toMill" ||
      sub.current === "mill" ||
      sub.current === "toTarget" ||
      sub.current === "place";
    if (carriedRef.current) {
      carriedRef.current.visible = carrying;
      if (carrying) {
        const tip = robot.gripperTip(currentPose.current);
        // plate geometry is in world space at its FINAL position; offset it so
        // its centroid rides on the gripper tip, easing to zero as we place
        const settle = sub.current === "place" ? k : 0;
        const offset = tip.sub(targetCentroid).multiplyScalar(1 - settle);
        // milling vibration
        if (sub.current === "mill") {
          offset.x += Math.sin(t.current * 80) * 0.015;
          offset.z += Math.cos(t.current * 95) * 0.015;
        }
        carriedRef.current.position.copy(offset);
      }
    }

    if (t.current >= 1) {
      if (sub.current === "place") {
        highestY.current = Math.max(highestY.current, currentPlate.centroid.y);
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
