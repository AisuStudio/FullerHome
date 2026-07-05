"use client";

import { useSimStore } from "@/lib/store";
import { PALLET_POS, MILL_POS } from "./BuildSimulation";

// ---------------------------------------------------------------------------
// Material pallets + on-site CNC milling station. Stacks shrink as plates
// are consumed by the build.
// ---------------------------------------------------------------------------

export default function MaterialYard() {
  const phase = useSimStore((s) => s.phase);
  const cursor = useSimStore((s) => s.cursor);
  const steps = useSimStore((s) => s.steps);

  if (phase === "planning") return null;

  const remaining = Math.max(0, steps.length - cursor);
  const stackHeight = Math.ceil(remaining / 4);

  return (
    <group>
      {/* --- pallet with raw plates --- */}
      <group position={[PALLET_POS.x, 0, PALLET_POS.z]}>
        <mesh position={[0, 0.07, 0]} receiveShadow>
          <boxGeometry args={[2.4, 0.14, 2.0]} />
          <meshStandardMaterial color="#7a5c28" roughness={0.9} />
        </mesh>
        {[-0.8, 0, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.03, 0]}>
            <boxGeometry args={[0.18, 0.1, 2.0]} />
            <meshStandardMaterial color="#5e4620" roughness={0.95} />
          </mesh>
        ))}
        {Array.from({ length: Math.min(stackHeight, 14) }).map((_, i) => (
          <mesh key={i} position={[0, 0.2 + i * 0.075, 0]} rotation-y={i * 0.22} castShadow>
            <cylinderGeometry args={[0.95, 0.95, 0.06, 6]} />
            <meshStandardMaterial color={i % 3 === 2 ? "#9F7845" : "#B08D57"} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* --- on-site CNC milling station --- */}
      <group position={[MILL_POS.x, 0, MILL_POS.z]}>
        {/* machine bed */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.9, 1.6]} />
          <meshStandardMaterial color="#3a3f44" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* work surface */}
        <mesh position={[0, 0.93, 0]}>
          <boxGeometry args={[2.0, 0.06, 1.4]} />
          <meshStandardMaterial color="#22262a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* gantry */}
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} position={[x, 1.35, 0]} castShadow>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshStandardMaterial color="#e8a030" metalness={0.55} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 1.72, 0]} castShadow>
          <boxGeometry args={[2.0, 0.14, 0.14]} />
          <meshStandardMaterial color="#e8a030" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* spindle */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.05, 0.5, 10]} />
          <meshStandardMaterial color="#c8c8d0" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* sawdust pile */}
        <mesh position={[0.9, 0.06, 0.9]}>
          <coneGeometry args={[0.5, 0.25, 12]} />
          <meshStandardMaterial color="#c9a86a" roughness={1} />
        </mesh>
        {/* warning stripes */}
        <mesh position={[0, 0.02, 1.1]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[2.4, 0.15]} />
          <meshStandardMaterial color="#e8a030" />
        </mesh>
      </group>

      {/* --- glass pallet, decorative --- */}
      <group position={[PALLET_POS.x + 0.4, 0, PALLET_POS.z + 2.6]}>
        <mesh position={[0, 0.07, 0]} receiveShadow>
          <boxGeometry args={[1.6, 0.14, 1.4]} />
          <meshStandardMaterial color="#7a5c28" roughness={0.9} />
        </mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 0.22 + i * 0.06, 0]} rotation-y={0.3} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.04, 6]} />
            <meshPhysicalMaterial color="#bcd8e8" transparent opacity={0.4} roughness={0.05} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
