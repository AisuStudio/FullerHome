"use client";

import { ShellDesign } from "@/lib/shell/types";
import { CARPORT_STILT_HEIGHT_M } from "@/lib/shell/generate";

const STILT_COUNT = 4;
const STILT_RADIUS_M = 0.14;

/** support legs for the Vehicle Shelter's roof cap, raised on stilts —
 *  purely visual, only rendered for the carport typology. Positioned at the
 *  shell's actual rim radius (a shallow cap's footprint is smaller than its
 *  own radius — see localCeiling's footprintR in generate.ts). */
export default function CarportStilts({ design }: { design: ShellDesign }) {
  if (design.config.houseType !== "shelter") return null;

  const r = design.config.radius;
  const rimR = r * Math.sqrt(Math.max(0, 1 - design.config.cutRatio ** 2)) - 0.2;

  return (
    <group>
      {Array.from({ length: STILT_COUNT }, (_, i) => {
        const angle = (i / STILT_COUNT) * Math.PI * 2 + Math.PI / STILT_COUNT;
        const x = Math.sin(angle) * rimR;
        const z = Math.cos(angle) * rimR;
        return (
          <mesh key={i} position={[x, CARPORT_STILT_HEIGHT_M / 2, z]} castShadow receiveShadow>
            <cylinderGeometry args={[STILT_RADIUS_M, STILT_RADIUS_M * 1.2, CARPORT_STILT_HEIGHT_M, 12]} />
            <meshStandardMaterial color="#8a8a86" metalness={0.4} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}
