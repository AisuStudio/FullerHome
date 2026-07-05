export type PlateMaterial = "wood" | "glass";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Plate {
  id: number;
  /** Polygon corners in world space (ordered around the plate normal) */
  vertices: Vec3[];
  /** Center of the plate (on the shell surface) */
  centroid: Vec3;
  /** Outward normal */
  normal: Vec3;
  /** 0 = foundation ring, growing upward */
  ring: number;
  /** ids of plates sharing an edge */
  neighbors: number[];
  material: PlateMaterial;
  /** true when removed for the entrance */
  isDoor: boolean;
}

export type HouseType = "iglu" | "panorama" | "loft";

export interface ShellConfig {
  houseType: HouseType;
  radius: number;
  /** icosahedron subdivision detail: 1..3 */
  detail: number;
  /** keep plates whose centroid y >= cutY (fraction of radius, e.g. -0.05) */
  cutRatio: number;
  /** 0..1 fraction of plates that become glass */
  glassRatio: number;
  /** angle (rad) around Y where the door goes */
  doorAngle: number;
  /** deterministic seed */
  seed: number;
}

/** flat glazed facade (panorama type): vertical cut plane */
export interface GlassFront {
  /** distance of the cut plane from center (along +z) */
  dist: number;
  /** radius of the semicircular opening at the plane */
  rc: number;
}

export interface BillOfMaterials {
  woodPlates: number;
  glassPlates: number;
  totalWeightKg: number;
}

export interface ShellDesign {
  config: ShellConfig;
  plates: Plate[];
  rings: number;
  bom: BillOfMaterials;
  /** present for the panorama type */
  glassFront?: GlassFront;
  /** y-height of the second-floor slab (loft type) */
  floorSlabY?: number;
}

export interface BuildStep {
  plateId: number;
  ring: number;
  /** index within the whole sequence */
  order: number;
}

export const DEFAULT_CONFIG: ShellConfig = {
  houseType: "iglu",
  radius: 6,
  detail: 2,
  cutRatio: -0.05,
  glassRatio: 0.18,
  doorAngle: 0,
  seed: 42,
};
