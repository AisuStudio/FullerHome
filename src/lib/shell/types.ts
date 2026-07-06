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

/** public building typologies (small → large); replaces the earlier private house types */
export type HouseType = "shelter" | "office" | "library";

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
  /** interior fit-out €/m² — driven by budget (basic → premium) */
  fitoutRate?: number;
  /** fabricated + installed timber shell €/m² */
  woodRate?: number;
  /** insulated glazing €/m² */
  glassRate?: number;
  /** foundation €/m² of footprint */
  foundationRate?: number;
  /** grid/water/sewage connection + services core, flat */
  utilitiesCost?: number;
  /** robot mobilization + on-site deployment, flat */
  robotCost?: number;
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
  /** flat street-facing glass front (office typology) */
  glassFront?: GlassFront;
  /** flat panorama window on the long side (library typology) */
  sideGlassFront?: GlassFront;
  /** y-height of the second-floor slab (library typology) */
  floorSlabY?: number;
}

export interface BuildStep {
  plateId: number;
  ring: number;
  /** index within the whole sequence */
  order: number;
}

export const DEFAULT_CONFIG: ShellConfig = {
  houseType: "shelter",
  radius: 6,
  detail: 2,
  cutRatio: -0.05,
  glassRatio: 0.18,
  doorAngle: 0,
  seed: 42,
};
