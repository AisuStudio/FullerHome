"use client";

import { useMemo } from "react";
import { useSimStore } from "@/lib/store";
import { depotLayout } from "@/lib/shell/stations";

// ---------------------------------------------------------------------------
// Material depot: raw-plate pallet + compact CNC milling station. For closed
// shells it sits at the center (crane-delivered through the still-open crown
// before shell work starts); the open shelter is served from the forecourt.
// Stacks shrink as plates are consumed by the build.
// ---------------------------------------------------------------------------

export default function MaterialYard() {
  const phase = useSimStore((s) => s.phase);
  const cursor = useSimStore((s) => s.cursor);
  const steps = useSimStore((s) => s.steps);
  const design = useSimStore((s) => s.design);
  const depot = useMemo(() => depotLayout(design), [design]);

  if (phase === "planning") return null;

  const remaining = Math.max(0, steps.length - cursor);
  const stackHeight = Math.ceil(remaining / 6);

  return (
    <group>
      {/* --- pallet with raw plates --- */}
      <group position={[depot.pallet.x, 0, depot.pallet.z]}>
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <boxGeometry args={[1.3, 0.1, 1.0]} />
          <meshStandardMaterial color="#7a5c28" roughness={0.9} />
        </mesh>
        {[-0.45, 0, 0.45].map((x) => (
          <mesh key={x} position={[x, 0.02, 0]}>
            <boxGeometry args={[0.12, 0.06, 1.0]} />
            <meshStandardMaterial color="#5e4620" roughness={0.95} />
          </mesh>
        ))}
        {Array.from({ length: Math.min(stackHeight, 10) }).map((_, i) => (
          <mesh key={i} position={[0, 0.14 + i * 0.055, 0]} rotation-y={i * 0.22} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.045, 6]} />
            <meshStandardMaterial color={i % 3 === 2 ? "#9F7845" : "#B08D57"} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* --- compact on-site CNC milling station --- */}
      <group position={[depot.mill.x, 0, depot.mill.z]}>
        {/* machine bed */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.6, 0.8]} />
          <meshStandardMaterial color="#3a3f44" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* work surface */}
        <mesh position={[0, 0.62, 0]}>
          <boxGeometry args={[1.0, 0.04, 0.7]} />
          <meshStandardMaterial color="#22262a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* gantry */}
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, 0.9, 0]} castShadow>
            <boxGeometry args={[0.08, 0.55, 0.08]} />
            <meshStandardMaterial color="#e8a030" metalness={0.55} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[1.0, 0.1, 0.1]} />
          <meshStandardMaterial color="#e8a030" metalness={0.55} roughness={0.35} />
        </mesh>
        {/* spindle */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.035, 0.35, 10]} />
          <meshStandardMaterial color="#c8c8d0" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* sawdust pile */}
        <mesh position={[0.55, 0.05, 0.45]}>
          <coneGeometry args={[0.3, 0.18, 12]} />
          <meshStandardMaterial color="#c9a86a" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}
