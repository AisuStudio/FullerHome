"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Plate, ShellDesign, BuildStep } from "@/lib/shell/types";
import { useSimStore } from "@/lib/store";

// ---------------------------------------------------------------------------
// Renders the plate shell. Placed plates are solid; unplaced ones show as a
// faint blueprint wireframe during planning/building.
// ---------------------------------------------------------------------------

function plateGeometry(plate: Plate): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const c = plate.centroid;
  const verts = plate.vertices;
  const positions: number[] = [];

  // triangle fan around centroid, both sides visible via material
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    positions.push(c.x, c.y, c.z, a.x, a.y, a.z, b.x, b.y, b.z);
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

const WOOD_COLORS = ["#B08D57", "#A67F4E", "#BC9663", "#9F7845"];

interface ShellStructureProps {
  design: ShellDesign;
  steps: BuildStep[];
  cursor: number;
  showBlueprint: boolean;
}

export default function ShellStructure({
  design,
  steps,
  cursor,
  showBlueprint,
}: ShellStructureProps) {
  const exitDone = useSimStore((s) => s.exitDone);

  const geometries = useMemo(
    () => design.plates.map((p) => plateGeometry(p)),
    [design]
  );

  const placedIds = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < cursor && i < steps.length; i++) s.add(steps[i].plateId);
    return s;
  }, [cursor, steps]);

  return (
    <group>
      {design.plates.map((plate) => {
        // door plates stay open as the robot's exit passage — the straight
        // portal vestibule (DoorAndInterior) replaces them after the exit
        if (plate.isDoor) {
          if (exitDone || !showBlueprint) return null;
          return (
            <mesh key={plate.id} geometry={geometries[plate.id]}>
              <meshBasicMaterial color="#1f1934" wireframe transparent opacity={0.22} />
            </mesh>
          );
        }
        const placed = placedIds.has(plate.id);

        if (!placed && !showBlueprint) return null;

        if (!placed) {
          // blueprint ghost — blueberry reads clearly on the light ground
          return (
            <mesh key={plate.id} geometry={geometries[plate.id]}>
              <meshBasicMaterial
                color="#1f1934"
                wireframe
                transparent
                opacity={0.22}
              />
            </mesh>
          );
        }

        if (plate.material === "glass") {
          return (
            <mesh key={plate.id} geometry={geometries[plate.id]} castShadow>
              <meshPhysicalMaterial
                color="#bcd8e8"
                transparent
                opacity={0.35}
                roughness={0.05}
                metalness={0}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        }

        return (
          <mesh key={plate.id} geometry={geometries[plate.id]} castShadow receiveShadow>
            <meshStandardMaterial
              color={WOOD_COLORS[plate.id % WOOD_COLORS.length]}
              roughness={0.75}
              metalness={0.02}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
