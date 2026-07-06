"use client";

import { Html } from "@react-three/drei";
import { useSimStore } from "@/lib/store";
import { buildingDims, LIBRARY_ELONGATION } from "@/lib/shell/generate";

// ---------------------------------------------------------------------------
// Ground dimension line (width across X) shown during planning, in front of
// the blueprint — ticks at both ends + a floating label like "10.4 m".
// ---------------------------------------------------------------------------

const LINE_COLOR = "#1f1934";

export default function DimensionLine() {
  const phase = useSimStore((s) => s.phase);
  const design = useSimStore((s) => s.design);

  if (phase !== "planning") return null;

  const dims = buildingDims(design);
  const r = design.config.radius;
  const elongation = design.config.houseType === "library" ? LIBRARY_ELONGATION : 1;
  // library width is cut on +x, so the measured span is asymmetric
  const xMin = -r;
  const xMax = design.config.houseType === "library" ? r * 0.4 : r;
  // place the line just in front of the footprint's +z extent
  const z = r * elongation + 1.4;
  const y = 0.03;
  const span = xMax - xMin;
  const mid = (xMin + xMax) / 2;

  return (
    <group position={[0, y, z]}>
      {/* main line */}
      <mesh position={[mid, 0, 0]}>
        <boxGeometry args={[span, 0.02, 0.05]} />
        <meshBasicMaterial color={LINE_COLOR} />
      </mesh>
      {/* end ticks */}
      {[xMin, xMax].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.05, 0.02, 0.5]} />
          <meshBasicMaterial color={LINE_COLOR} />
        </mesh>
      ))}
      {/* label */}
      <Html position={[mid, 0.1, 0.55]} center distanceFactor={12}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#1f1934",
            background: "rgba(234, 232, 224, 0.9)",
            padding: "2px 10px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            border: "1px solid #1f1934",
          }}
        >
          {dims.widthM} m
        </div>
      </Html>
    </group>
  );
}
