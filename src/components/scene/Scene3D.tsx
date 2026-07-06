"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import ShellStructure from "./ShellStructure";
import BuildSimulation from "./BuildSimulation";
import MaterialYard from "./MaterialYard";
import DoorAndInterior from "./DoorAndInterior";
import DimensionLine from "./DimensionLine";
import { useSimStore } from "@/lib/store";
import { LIBRARY_ELONGATION } from "@/lib/shell/generate";

export default function Scene3D() {
  const design = useSimStore((s) => s.design);
  const steps = useSimStore((s) => s.steps);
  const cursor = useSimStore((s) => s.cursor);
  const phase = useSimStore((s) => s.phase);

  return (
    <Canvas
      id="scene-canvas"
      shadows
      camera={{ position: [15, 9, 15], fov: 46 }}
      gl={{ antialias: true }}
      style={{ background: "#e2e0d6" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight args={["#f4f2ea", "#b8b6ac", 0.6]} />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#d6d4c8" roughness={0.95} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#c4c2b6"
        sectionSize={5}
        sectionThickness={0.7}
        sectionColor="#b0aea2"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid
      />

      {/* foundation ring marker — stretched along Z for the elongated library plan */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, design.config.houseType === "library" ? LIBRARY_ELONGATION : 1, 1]}
        position={[0, 0.005, 0]}
      >
        <ringGeometry args={[design.config.radius - 0.35, design.config.radius + 0.15, 64]} />
        <meshStandardMaterial color="#b8b6aa" />
      </mesh>

      <ShellStructure
        design={design}
        steps={steps}
        cursor={cursor}
        showBlueprint={phase === "planning" || phase === "delivery" || phase === "building"}
      />

      <BuildSimulation />
      <MaterialYard />
      <DoorAndInterior />
      <DimensionLine />

      <OrbitControls
        makeDefault
        target={[0, 2.5, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  );
}
