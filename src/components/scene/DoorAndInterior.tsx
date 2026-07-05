"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useSimStore } from "@/lib/store";

// ---------------------------------------------------------------------------
// Real door (frame + glass leaf) in the door opening, plus interior: wood
// floor and warm light, visible through door and glass plates.
// ---------------------------------------------------------------------------

export default function DoorAndInterior() {
  const design = useSimStore((s) => s.design);
  const cursor = useSimStore((s) => s.cursor);
  const steps = useSimStore((s) => s.steps);
  const phase = useSimStore((s) => s.phase);

  const doorInfo = useMemo(() => {
    const doorPlate = design.plates.find((p) => p.isDoor);
    if (!doorPlate) return null;
    // derive position from the ACTUAL door plate, not the requested angle —
    // the chosen plate can sit tens of degrees away from config.doorAngle
    const c = doorPlate.centroid;
    const angle = Math.atan2(c.x, c.z);
    const r = design.config.radius;
    return { angle, r };
  }, [design]);

  // door frame + leaf install together with the door plate, after the robot left
  const exitDone = useSimStore((s) => s.exitDone);
  const showDoor = exitDone;
  const showInterior = cursor > 0;
  const buildRatio = steps.length > 0 ? cursor / steps.length : 0;
  const glassFront = design.glassFront;
  const slabY = design.floorSlabY;
  const yOff = -design.config.cutRatio * design.config.radius;

  if (!doorInfo) return null;

  const { angle, r } = doorInfo;
  // vestibule straddles the shell surface (front face protrudes outside)
  const doorDist = r * 0.96;
  const doorW = 1.15;
  const doorH = 2.15;
  const frameT = 0.09;

  return (
    <group>
      {/* interior: wood floor */}
      {showInterior && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <circleGeometry args={[r * 0.9, 48]} />
          <meshStandardMaterial color="#c4a066" roughness={0.65} />
        </mesh>
      )}

      {/* interior: warm light, grows with the build */}
      {showInterior && (
        <pointLight
          position={[0, 2.2, 0]}
          intensity={Math.min(1.2, (cursor / Math.max(1, steps.length)) * 1.6)}
          distance={r * 2.4}
          color="#ffc888"
        />
      )}

      {/* panorama: straight mullioned glass facade (installed near end of shell) */}
      {glassFront && buildRatio > 0.75 && (
        <group position={[0, 0, glassFront.dist]}>
          {(() => {
            const strips: React.ReactNode[] = [];
            const w = 0.65;
            const n = Math.floor((glassFront.rc * 2) / w);
            for (let i = 0; i < n; i++) {
              const x = -glassFront.rc + w / 2 + i * w;
              const hSq = glassFront.rc * glassFront.rc - x * x;
              if (hSq <= 0.05) continue;
              const h = Math.sqrt(hSq) + yOff;
              strips.push(
                <group key={i}>
                  <mesh position={[x, h / 2, 0]} castShadow>
                    <boxGeometry args={[w - 0.07, h, 0.05]} />
                    <meshPhysicalMaterial
                      color="#cfe4f0"
                      transparent
                      opacity={0.35}
                      roughness={0.05}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  {/* mullion */}
                  <mesh position={[x + w / 2, (h * 0.97) / 2, 0]} castShadow>
                    <boxGeometry args={[0.07, h * 0.97, 0.09]} />
                    <meshStandardMaterial color="#4a3a22" roughness={0.7} />
                  </mesh>
                </group>
              );
            }
            return strips;
          })()}
          {/* base sill */}
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[glassFront.rc * 2 + 0.2, 0.1, 0.25]} />
            <meshStandardMaterial color="#4a3a22" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* loft: second-floor slab + stairs, prefab modules lowered in through
          the still-open crown — visualized as staged appearance with build progress */}
      {slabY !== undefined && buildRatio > 0.55 && (() => {
        const r2sq = r * r - (slabY - yOff) * (slabY - yOff);
        if (r2sq <= 1) return null;
        const r2 = Math.sqrt(r2sq) * 0.92;
        // stairs get installed step by step between 55% and 80% build progress
        const stairProgress = Math.min(1, Math.max(0, (buildRatio - 0.55) / 0.25));
        const visibleSteps = Math.floor(stairProgress * 10);
        return (
          <group position={[0, slabY, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
              <ringGeometry args={[1.1, r2, 48]} />
              <meshStandardMaterial color="#c4a066" roughness={0.65} side={THREE.DoubleSide} />
            </mesh>
            {/* slab edge */}
            <mesh position={[0, -0.09, 0]}>
              <cylinderGeometry args={[r2, r2, 0.18, 48, 1, true]} />
              <meshStandardMaterial color="#8a6a3a" roughness={0.8} side={THREE.DoubleSide} />
            </mesh>
            {/* spiral stair: prefab module, steps appear with progress */}
            {visibleSteps > 0 && (
              <mesh position={[0, -slabY / 2, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, slabY, 10]} />
                <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.3} />
              </mesh>
            )}
            {Array.from({ length: visibleSteps }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.sin(i * 0.62) * 0.55,
                  -slabY + (i + 1) * (slabY / 11),
                  Math.cos(i * 0.62) * 0.55,
                ]}
                rotation-y={i * 0.62}
                castShadow
              >
                <boxGeometry args={[0.85, 0.05, 0.3]} />
                <meshStandardMaterial color="#c4a066" roughness={0.65} />
              </mesh>
            ))}
          </group>
        );
      })()}

      {/* straight portal vestibule (dormer) — installed from outside after the
          robot has exited; covers the two-plate-high opening */}
      {showDoor && (
        <group
          position={[Math.sin(angle) * doorDist, 0, Math.cos(angle) * doorDist]}
          rotation={[0, angle, 0]}
        >
          {(() => {
            const pw = 2.6; // portal width — overlaps the opening rim
            const ph = 2.8; // portal height
            const pd = 1.1; // depth, straddling the shell surface
            const post = 0.14;
            const wood = <meshStandardMaterial color="#6B4A26" roughness={0.7} />;
            const glass = (
              <meshPhysicalMaterial
                color="#cfe4f0"
                transparent
                opacity={0.38}
                roughness={0.05}
                side={THREE.DoubleSide}
              />
            );
            return (
              <>
                {/* corner posts */}
                {[-pw / 2, pw / 2].map((x) =>
                  [-pd / 2, pd / 2].map((z) => (
                    <mesh key={`${x},${z}`} position={[x, ph / 2, z]} castShadow>
                      <boxGeometry args={[post, ph, post]} />
                      {wood}
                    </mesh>
                  ))
                )}
                {/* flat roof */}
                <mesh position={[0, ph + 0.05, 0]} castShadow>
                  <boxGeometry args={[pw + 0.3, 0.12, pd + 0.3]} />
                  {wood}
                </mesh>
                {/* side glass walls */}
                {[-pw / 2, pw / 2].map((x) => (
                  <mesh key={x} position={[x, ph / 2, 0]} castShadow>
                    <boxGeometry args={[0.05, ph - 0.1, pd - post]} />
                    {glass}
                  </mesh>
                ))}
                {/* front face: sidelights + door frame */}
                {[-1, 1].map((s) => (
                  <mesh
                    key={s}
                    position={[s * (pw / 4 + doorW / 4), ph / 2, pd / 2]}
                    castShadow
                  >
                    <boxGeometry args={[pw / 2 - doorW / 2 - post, ph - 0.1, 0.05]} />
                    {glass}
                  </mesh>
                ))}
                {/* transom above the door */}
                <mesh position={[0, doorH + (ph - doorH) / 2, pd / 2]} castShadow>
                  <boxGeometry args={[doorW, ph - doorH - 0.1, 0.05]} />
                  {glass}
                </mesh>
                {/* door frame posts + lintel */}
                {[-doorW / 2, doorW / 2].map((x) => (
                  <mesh key={x} position={[x, doorH / 2, pd / 2]} castShadow>
                    <boxGeometry args={[frameT, doorH, frameT * 1.8]} />
                    {wood}
                  </mesh>
                ))}
                <mesh position={[0, doorH + frameT / 2, pd / 2]} castShadow>
                  <boxGeometry args={[doorW + frameT, frameT, frameT * 1.8]} />
                  {wood}
                </mesh>
                {/* glass door leaf, ajar */}
                <group
                  position={[-doorW / 2 + frameT / 2, 0, pd / 2]}
                  rotation={[0, -0.5, 0]}
                >
                  <mesh position={[(doorW - frameT) / 2, doorH / 2, 0]} castShadow>
                    <boxGeometry args={[doorW - frameT, doorH - 0.04, 0.05]} />
                    {glass}
                  </mesh>
                  <mesh position={[doorW - frameT - 0.12, doorH * 0.48, 0.06]}>
                    <boxGeometry args={[0.04, 0.22, 0.03]} />
                    <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
                {/* threshold */}
                <mesh position={[0, 0.02, pd / 2]} receiveShadow>
                  <boxGeometry args={[pw, 0.05, 0.6]} />
                  <meshStandardMaterial color="#8a6a3a" roughness={0.8} />
                </mesh>
              </>
            );
          })()}
        </group>
      )}
    </group>
  );
}
