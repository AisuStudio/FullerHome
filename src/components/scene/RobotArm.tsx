"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Modeled after the In-situ Fabricator (ETH Zurich, NCCR Digital Fabrication):
// tracked mobile base + articulated 2-link arm. Concept extensions for this
// sim: vertical lift column and a heavier vacuum gripper.
// Posed imperatively per frame via ref.
// ---------------------------------------------------------------------------

export const L1 = 3.4; // upper arm
export const L2 = 3.2; // forearm
/** height of the slew ring above ground (tracks + body) */
export const BASE_Y = 0.95;

export interface RobotPose {
  yaw: number;
  mastHeight: number;
  /** shoulder pitch: 0 = horizontal, +up */
  shoulder: number;
  /** elbow bend relative to upper arm (0 = straight) */
  elbow: number;
}

export interface RobotArmHandle {
  setPose: (pose: RobotPose) => void;
  gripperTip: (pose: RobotPose) => THREE.Vector3;
}

export const HOME_POSE: RobotPose = {
  yaw: 0,
  mastHeight: 1.6,
  shoulder: 0.9,
  elbow: -1.8,
};

/** folded flat (~1.5m tall) so the robot fits through the door opening */
export const EXIT_POSE: RobotPose = {
  yaw: 0,
  mastHeight: 0.9,
  shoulder: 0.12,
  elbow: -2.9,
};

/** 2-link IK in the vertical plane through the target (elbow-up solution) */
export function solveIK(target: THREE.Vector3, mastHeight: number): RobotPose {
  const yaw = Math.atan2(target.x, target.z);
  const d = Math.sqrt(target.x * target.x + target.z * target.z);
  const dy = target.y - (mastHeight + BASE_Y);

  let r = Math.sqrt(d * d + dy * dy);
  r = Math.min(Math.max(r, Math.abs(L1 - L2) + 0.05), L1 + L2 - 0.05);

  const cosElbow = (L1 * L1 + L2 * L2 - r * r) / (2 * L1 * L2);
  const elbowInner = Math.acos(Math.min(1, Math.max(-1, cosElbow)));
  const elbow = -(Math.PI - elbowInner); // negative = elbow up/back

  const cosAlpha = (L1 * L1 + r * r - L2 * L2) / (2 * L1 * r);
  const alpha = Math.acos(Math.min(1, Math.max(-1, cosAlpha)));
  const shoulder = Math.atan2(dy, d) + alpha;

  return { yaw, mastHeight, shoulder, elbow };
}

const RobotArm = forwardRef<RobotArmHandle>(function RobotArm(_props, ref) {
  const turretRef = useRef<THREE.Group>(null);
  const mastRef = useRef<THREE.Mesh>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);

  useImperativeHandle(ref, () => ({
    setPose: (pose) => {
      if (turretRef.current) turretRef.current.rotation.y = pose.yaw;
      if (mastRef.current) {
        mastRef.current.scale.y = pose.mastHeight;
        mastRef.current.position.y = pose.mastHeight / 2;
      }
      if (shoulderRef.current) {
        shoulderRef.current.position.y = pose.mastHeight;
        // shoulder pitch rotates about local x; arm extends along +z
        shoulderRef.current.rotation.x = -pose.shoulder;
      }
      if (elbowRef.current) {
        elbowRef.current.rotation.x = -pose.elbow;
      }
    },
    gripperTip: (pose) => {
      // FK in the vertical plane, then rotate by yaw
      const d1 = L1 * Math.cos(pose.shoulder);
      const y1 = L1 * Math.sin(pose.shoulder);
      const a2 = pose.shoulder + pose.elbow;
      const d2 = d1 + L2 * Math.cos(a2);
      const y2 = y1 + L2 * Math.sin(a2);
      return new THREE.Vector3(
        Math.sin(pose.yaw) * d2,
        BASE_Y + pose.mastHeight + y2,
        Math.cos(pose.yaw) * d2
      );
    },
  }));

  // In-situ Fabricator look: dark crawler tracks, steel body, white arm
  const white = <meshStandardMaterial color="#e8e8e6" metalness={0.3} roughness={0.4} />;
  const steel = <meshStandardMaterial color="#b8b8bc" metalness={0.7} roughness={0.3} />;
  const dark = <meshStandardMaterial color="#26262a" metalness={0.7} roughness={0.35} />;
  const track = <meshStandardMaterial color="#1c1c20" metalness={0.4} roughness={0.7} />;

  return (
    <group>
      {/* crawler tracks */}
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 0.28, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.5, 2.3]} />
            {track}
          </mesh>
          {/* drive wheels hint */}
          {[-0.85, 0, 0.85].map((z) => (
            <mesh key={z} position={[0, -0.05, z]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.16, 0.16, 0.46, 12]} />
              <meshStandardMaterial color="#3a3a3e" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* body: power pack + control unit */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.7, 0.45, 2.0]} />
        {steel}
      </mesh>
      <mesh position={[0, 0.99, -0.6]} castShadow>
        <boxGeometry args={[1.5, 0.35, 0.7]} />
        {dark}
      </mesh>
      {/* warning beacon */}
      <mesh position={[0.6, 1.05, -0.85]}>
        <cylinderGeometry args={[0.05, 0.05, 0.14, 8]} />
        <meshStandardMaterial color="#e8a030" emissive="#e8a030" emissiveIntensity={0.6} />
      </mesh>

      <group ref={turretRef} position={[0, BASE_Y, 0]}>
        {/* slew ring */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.48, 0.18, 20]} />
          {dark}
        </mesh>

        {/* vertical lift column (unit height, scaled) — concept extension of the IF */}
        <mesh ref={mastRef} castShadow>
          <boxGeometry args={[0.4, 1, 0.4]} />
          {steel}
        </mesh>

        {/* shoulder joint */}
        <group ref={shoulderRef}>
          <mesh castShadow rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.3, 0.3, 0.55, 16]} />
            {dark}
          </mesh>

          {/* upper arm along +z */}
          <mesh position={[0, 0, L1 / 2]} castShadow>
            <boxGeometry args={[0.3, 0.38, L1]} />
            {white}
          </mesh>
          {/* hydraulic detail */}
          <mesh position={[0, 0.26, L1 * 0.35]} castShadow rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.06, 0.06, L1 * 0.6, 8]} />
            {steel}
          </mesh>

          {/* elbow */}
          <group position={[0, 0, L1]} ref={elbowRef}>
            <mesh castShadow rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.24, 0.24, 0.5, 16]} />
              {dark}
            </mesh>

            {/* forearm */}
            <mesh position={[0, 0, L2 / 2]} castShadow>
              <boxGeometry args={[0.22, 0.28, L2]} />
              {white}
            </mesh>

            {/* wrist + vacuum gripper */}
            <group position={[0, 0, L2]}>
              <mesh castShadow>
                <sphereGeometry args={[0.16, 12, 12]} />
                {dark}
              </mesh>
              <mesh position={[0, 0, 0.14]} castShadow rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.2, 0.2, 0.07, 12]} />
                {steel}
              </mesh>
              {[-0.1, 0.1].map((x) =>
                [-0.1, 0.1].map((y) => (
                  <mesh key={`${x},${y}`} position={[x, y, 0.2]} rotation-x={Math.PI / 2}>
                    <cylinderGeometry args={[0.035, 0.05, 0.05, 8]} />
                    <meshStandardMaterial color="#333" roughness={0.6} />
                  </mesh>
                ))
              )}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

export default RobotArm;
