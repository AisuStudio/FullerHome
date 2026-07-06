import {
  Plate,
  ShellConfig,
  ShellDesign,
  Vec3,
  DEFAULT_CONFIG,
  HouseType,
  GlassFront,
} from "./types";

// ---------------------------------------------------------------------------
// Pure, deterministic plate-shell generator (Goldberg dual of a geodesic
// icosphere). No three.js dependency so it can run in plain node for checks.
// ---------------------------------------------------------------------------

const PHI = (1 + Math.sqrt(5)) / 2;

const ICO_VERTS: Vec3[] = [
  { x: -1, y: PHI, z: 0 }, { x: 1, y: PHI, z: 0 }, { x: -1, y: -PHI, z: 0 },
  { x: 1, y: -PHI, z: 0 }, { x: 0, y: -1, z: PHI }, { x: 0, y: 1, z: PHI },
  { x: 0, y: -1, z: -PHI }, { x: 0, y: 1, z: -PHI }, { x: PHI, y: 0, z: -1 },
  { x: PHI, y: 0, z: 1 }, { x: -PHI, y: 0, z: -1 }, { x: -PHI, y: 0, z: 1 },
];

const ICO_FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

const norm = (v: Vec3): Vec3 => {
  const l = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  return { x: v.x / l, y: v.y / l, z: v.z / l };
};
const scale = (v: Vec3, s: number): Vec3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

const key = (v: Vec3) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;

/** deterministic 0..1 hash */
function seededHash(seed: number, n: number): number {
  let h = (seed * 374761393 + n * 668265263) | 0;
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

interface IcoMesh {
  verts: Vec3[]; // on sphere, radius applied
  faces: [number, number, number][];
}

/** subdivide icosahedron: each edge split into `freq` segments, projected to sphere */
function buildIcosphere(radius: number, freq: number): IcoMesh {
  const verts: Vec3[] = [];
  const lookup = new Map<string, number>();
  const faces: [number, number, number][] = [];

  const getIndex = (v: Vec3): number => {
    const p = scale(norm(v), radius);
    const k = key(p);
    let idx = lookup.get(k);
    if (idx === undefined) {
      idx = verts.length;
      verts.push(p);
      lookup.set(k, idx);
    }
    return idx;
  };

  for (const [ia, ib, ic] of ICO_FACES) {
    const A = ICO_VERTS[ia];
    const B = ICO_VERTS[ib];
    const C = ICO_VERTS[ic];

    // barycentric grid: rows of points
    const grid: number[][] = [];
    for (let i = 0; i <= freq; i++) {
      const row: number[] = [];
      for (let j = 0; j <= i; j++) {
        // interpolate A->B (i) and along row toward C
        const a = (freq - i) / freq;
        const b = (i - j) / freq;
        const c = j / freq;
        const p: Vec3 = {
          x: A.x * a + B.x * b + C.x * c,
          y: A.y * a + B.y * b + C.y * c,
          z: A.z * a + B.z * b + C.z * c,
        };
        row.push(getIndex(p));
      }
      grid.push(row);
    }

    for (let i = 0; i < freq; i++) {
      for (let j = 0; j <= i; j++) {
        faces.push([grid[i][j], grid[i + 1][j], grid[i + 1][j + 1]]);
        if (j < i) {
          faces.push([grid[i][j], grid[i + 1][j + 1], grid[i][j + 1]]);
        }
      }
    }
  }

  return { verts, faces };
}

/** cluster sorted y-values into rings */
function assignRings(plates: Plate[], epsilon: number): number {
  const sorted = [...plates].sort((a, b) => a.centroid.y - b.centroid.y);
  let ring = -1;
  let lastY = -Infinity;
  for (const p of sorted) {
    if (p.centroid.y - lastY > epsilon) {
      ring++;
      lastY = p.centroid.y;
    }
    p.ring = ring;
  }
  return ring + 1;
}

function polygonArea(vertices: Vec3[], centroid: Vec3): number {
  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = sub(vertices[i], centroid);
    const b = sub(vertices[(i + 1) % vertices.length], centroid);
    const c = cross(a, b);
    area += Math.sqrt(dot(c, c)) / 2;
  }
  return area;
}

// ---------------------------------------------------------------------------
// Budget model: (typology, budget) → shell parameters + cost breakdown.
// Footprint is fixed per typology, so a higher budget buys a higher spec
// tier (rate tables below) rather than more floor area — from simple
// weatherproof timber up to acoustic/fire-rated, high-load-bearing
// construction and richer building systems.
// ---------------------------------------------------------------------------

export interface CostBreakdown {
  wood: number;
  glass: number;
  foundation: number;
  fitout: number;
  utilities: number;
  robot: number;
  planning: number;
  total: number;
  floorAreaM2: number;
  shellAreaM2: number;
  /** robot shell assembly incl. on-site milling */
  buildHours: number;
  /** shell erection at 20 robot-hours/day */
  shellDays: number;
  /** interior fit-out estimate */
  fitoutWeeks: number;
}

// Per-typology budget range (gross project budget, incl. planning & permits).
// Ranges reflect real orders of magnitude for these public-building categories.
export const TYPE_BUDGET: Record<HouseType, { min: number; max: number; step: number }> = {
  shelter: { min: 25_000, max: 80_000, step: 2_500 },
  office: { min: 100_000, max: 900_000, step: 20_000 },
  library: { min: 1_200_000, max: 9_000_000, step: 100_000 },
};

// Realistic shell size RANGE per typology — budget now scales footprint
// (primary lever) plus build quality (secondary). Size is no longer capped
// by arm reach: the robot repositions between work stations inside the
// footprint (src/lib/shell/stations.ts), like the real In-situ Fabricator.
const TYPE_RADIUS_RANGE: Record<HouseType, Range> = {
  shelter: { min: 2.0, max: 2.9 }, // ~11–22 m²
  office: { min: 4.0, max: 6.0 }, // ~43–96 m²
  library: { min: 4.2, max: 6.0 }, // ×1.1 elongation, two levels — ~95–190 m² total
};

// The library is stretched along Z into an elongated, gallery-like plan (like
// the ITKE Landesgartenschau pavilion) rather than a symmetric dome — reads
// as a substantial civic building rather than a small dome, especially
// combined with the long-side panorama window (sideGlassFront, below).
export const LIBRARY_ELONGATION = 1.1;

// Twin-lobe "peanut" pinch: how much the girth (x/y) shrinks at the center
// (0 = no pinch, plain ellipsoid) and how narrow that pinch is (smaller =
// tighter waist, more sharply two separate humps). Kept gentle: a deep/tight
// pinch reads messy at low mesh resolution (small budgets use fewer plates)
// and exaggerates the building's apparent size relative to the robot.
export const LIBRARY_SADDLE_DEPTH = 0.2;
export const LIBRARY_SADDLE_WIDTH = 0.5;

interface Range { min: number; max: number }
const lerp = (r: Range, t: number) => r.min + t * (r.max - r.min);

// Fabricated + installed rate ranges (basic spec at t=0 → premium/heavy-duty
// spec at t=1). A shelter needs simple weatherproof timber; a branch library
// needs acoustic/fire-rated, high-load-bearing (book stacks ~7.2 kN/m²)
// construction — hence the much wider ceiling.
const TYPE_WOOD_RATE: Record<HouseType, Range> = {
  shelter: { min: 220, max: 560 },
  office: { min: 200, max: 900 },
  library: { min: 650, max: 2_400 },
};
const TYPE_GLASS_RATE: Record<HouseType, Range> = {
  shelter: { min: 300, max: 650 },
  office: { min: 350, max: 1_400 },
  library: { min: 900, max: 3_200 },
};
const TYPE_FOUNDATION_RATE: Record<HouseType, Range> = {
  shelter: { min: 100, max: 320 },
  office: { min: 90, max: 380 },
  library: { min: 350, max: 900 },
};
// Fit-out standard range €/m²: a park shelter needs almost none, a branch
// library needs shelving, media points, climate-controlled archives.
const TYPE_FITOUT_RATE: Record<HouseType, Range> = {
  shelter: { min: 180, max: 1_000 },
  office: { min: 400, max: 3_500 },
  library: { min: 3_000, max: 13_000 },
};
// Utilities connection + robot mobilization scale with tier: bigger
// electrical/water loads, fire systems, and more days of robot deployment.
const TYPE_UTILITIES_RATE: Record<HouseType, Range> = {
  shelter: { min: 1_500, max: 8_000 },
  office: { min: 5_000, max: 60_000 },
  library: { min: 100_000, max: 520_000 },
};
const TYPE_ROBOT_RATE: Record<HouseType, Range> = {
  shelter: { min: 5_000, max: 16_000 },
  office: { min: 8_000, max: 70_000 },
  library: { min: 130_000, max: 450_000 },
};

export function configForBudget(budget: number, houseType: HouseType): Partial<ShellConfig> {
  const { min, max } = TYPE_BUDGET[houseType];
  const t = Math.min(1, Math.max(0, (budget - min) / (max - min)));
  const base: Partial<ShellConfig> = {
    houseType,
    // budget scales footprint first (rounded to dm for stable geometry keys),
    // then build quality: plate resolution, glazing share, spec-level rates
    radius: Math.round(lerp(TYPE_RADIUS_RANGE[houseType], t) * 10) / 10,
    detail: t < 0.33 ? 1 : t < 0.66 ? 2 : 3,
    glassRatio: 0.08 + t * 0.12,
    woodRate: Math.round(lerp(TYPE_WOOD_RATE[houseType], t)),
    glassRate: Math.round(lerp(TYPE_GLASS_RATE[houseType], t)),
    foundationRate: Math.round(lerp(TYPE_FOUNDATION_RATE[houseType], t)),
    fitoutRate: Math.round(lerp(TYPE_FITOUT_RATE[houseType], t)),
    utilitiesCost: Math.round(lerp(TYPE_UTILITIES_RATE[houseType], t)),
    robotCost: Math.round(lerp(TYPE_ROBOT_RATE[houseType], t)),
  };
  if (houseType === "shelter") {
    // open "Muschel" band shell: pure timber, no glazing, no door
    base.glassRatio = 0;
  }
  if (houseType === "office") {
    // straight glass front (street-facing) replaces most shell glazing; door to the side
    base.glassRatio = 0.05 + t * 0.08;
    base.doorAngle = 2.4;
  }
  if (houseType === "library") {
    // taller-than-hemisphere bulb for two levels; more glazing for reading light
    base.cutRatio = -0.32;
    base.glassRatio = 0.12 + t * 0.23;
    // the twin-lobe pinch needs a bit more mesh resolution to read cleanly
    // than a plain dome — never drop to the coarsest (freq=2) subdivision
    base.detail = Math.max(2, base.detail as number);
  }
  return base;
}

export interface BuildingDims {
  /** footprint across, m (X axis) */
  widthM: number;
  /** footprint along, m (Z axis — longer for the elongated library) */
  lengthM: number;
  /** shell crown height above ground, m */
  heightM: number;
}

/** outer footprint + height of the generated shell, for dimension displays */
export function buildingDims(design: ShellDesign): BuildingDims {
  const r = design.config.radius;
  const elongation = design.config.houseType === "library" ? LIBRARY_ELONGATION : 1;
  // crown height: sphere top shifted up by the ground cut (see generateShell's yOff)
  const heightM = r * (1 - design.config.cutRatio);
  // flat cut planes trim one side: office along +z (glass front at r·0.45),
  // shelter along +z (open front at r·0.2), library along +x (panorama window)
  const lengthM =
    design.config.houseType === "office"
      ? r + r * 0.45
      : design.config.houseType === "shelter"
        ? r + r * 0.2
        : 2 * r * elongation;
  const widthM = design.config.houseType === "library" ? r + r * 0.4 : 2 * r;
  return {
    widthM: Math.round(widthM * 10) / 10,
    lengthM: Math.round(lengthM * 10) / 10,
    heightM: Math.round(heightM * 10) / 10,
  };
}

export function computeCosts(design: ShellDesign): CostBreakdown {
  let woodArea = 0;
  let glassArea = 0;
  for (const p of design.plates) {
    const area = polygonArea(p.vertices, p.centroid);
    if (p.material === "glass") glassArea += area;
    else woodArea += area;
  }
  // office: flat glazed facade (semicircular area at the cut plane)
  if (design.glassFront) {
    glassArea += (Math.PI / 2) * design.glassFront.rc * design.glassFront.rc;
  }
  // library: long-side panorama window (elongated semi-ellipse — exact area
  // since only the Z axis is stretched: half-ellipse = (π/2)·rc·(rc·elongation))
  if (design.sideGlassFront) {
    glassArea +=
      (Math.PI / 2) * design.sideGlassFront.rc * design.sideGlassFront.rc * LIBRARY_ELONGATION;
  }

  const r = design.config.radius;
  const elongation = design.config.houseType === "library" ? LIBRARY_ELONGATION : 1;
  const footprintAreaM2 = Math.PI * r * r * 0.85 * elongation; // usable footprint (ellipse when elongated)
  let floorAreaM2 = footprintAreaM2;
  // library: add the second-floor slab area
  if (design.floorSlabY !== undefined) {
    const r2sq = r * r - design.floorSlabY * design.floorSlabY;
    if (r2sq > 0) floorAreaM2 += Math.PI * r2sq * 0.8 * elongation;
  }

  const plateCount = design.plates.length;
  const woodRate = design.config.woodRate ?? 420;
  const glassRate = design.config.glassRate ?? 650;
  const foundationRate = design.config.foundationRate ?? 180;
  const fitoutRate = design.config.fitoutRate ?? 1_400;
  const utilities = design.config.utilitiesCost ?? 25_000;
  const robot = design.config.robotCost ?? 35_000;

  // fabricated + installed rates (not raw material): CLT shell incl. milling,
  // connectors and weatherproofing layer; insulated safety glazing; slab-on-grade
  const wood = Math.round(woodArea * woodRate);
  const glass = Math.round(glassArea * glassRate);
  const foundation = Math.round(footprintAreaM2 * foundationRate);
  const fitout = Math.round(floorAreaM2 * fitoutRate); // floors, bath, kitchen, electrics, HVAC
  const slab = design.floorSlabY !== undefined
    ? Math.round((floorAreaM2 - footprintAreaM2) * woodRate)
    : 0;
  const subtotal = wood + slab + glass + foundation + fitout + utilities + robot;
  const planning = Math.round(subtotal * 0.08); // architect, structural, permits

  // 0.4h per plate: pick + on-site CNC milling + repositioning drives + place
  const buildHours = Math.round(plateCount * 0.4 + (design.glassFront ? 10 : 0));
  const shellDays = Math.max(1, Math.ceil(buildHours / 20));
  const fitoutWeeks = Math.max(2, Math.ceil(floorAreaM2 / 22));

  return {
    wood: wood + slab,
    glass,
    foundation,
    fitout,
    utilities,
    robot,
    planning,
    total: subtotal + planning,
    floorAreaM2: Math.round(floorAreaM2),
    shellAreaM2: Math.round(woodArea + glassArea),
    buildHours,
    shellDays,
    fitoutWeeks,
  };
}

export function generateShell(partial?: Partial<ShellConfig>): ShellDesign {
  const config: ShellConfig = { ...DEFAULT_CONFIG, ...partial };
  const { radius, detail, cutRatio, glassRatio, doorAngle, seed } = config;

  const freq = detail + 1;
  const mesh = buildIcosphere(radius, freq);

  // library: twin-lobe "peanut" silhouette (two dome humps pinched together
  // at a central saddle, matching the ITKE Landesgartenschau reference photo)
  // rather than a plain stretched ellipsoid. Order matters: the pinch profile
  // is computed from the UNSTRETCHED z (so its shape doesn't depend on the
  // elongation factor), applied to x/y (the girth), then z is elongated for
  // overall length — all before anything downstream (centroids, plates) is
  // derived from these vertices.
  if (config.houseType === "library") {
    for (const v of mesh.verts) {
      const u = v.z / radius; // -1..1 along the long axis, pre-elongation
      const girth = 1 - LIBRARY_SADDLE_DEPTH * Math.exp(-(u * u) / (LIBRARY_SADDLE_WIDTH ** 2));
      v.x *= girth;
      v.y *= girth;
      v.z *= LIBRARY_ELONGATION;
    }
  }

  // face centroids
  const faceCentroids: Vec3[] = mesh.faces.map(([a, b, c]) =>
    scale(add(add(mesh.verts[a], mesh.verts[b]), mesh.verts[c]), 1 / 3)
  );

  // vertex -> adjacent face ids
  const vertFaces = new Map<number, number[]>();
  mesh.faces.forEach((face, fi) => {
    for (const vi of face) {
      const list = vertFaces.get(vi) ?? [];
      list.push(fi);
      vertFaces.set(vi, list);
    }
  });

  // vertex adjacency (shared edge in triangulation = shared edge in dual)
  const vertNeighbors = new Map<number, Set<number>>();
  for (const [a, b, c] of mesh.faces) {
    for (const [u, v] of [[a, b], [b, c], [c, a]] as [number, number][]) {
      if (!vertNeighbors.has(u)) vertNeighbors.set(u, new Set());
      if (!vertNeighbors.has(v)) vertNeighbors.set(v, new Set());
      vertNeighbors.get(u)!.add(v);
      vertNeighbors.get(v)!.add(u);
    }
  }

  const cutY = cutRatio * radius;

  // vertical cut plane along +z: office gets a flat glass facade there;
  // the shelter is a "Muschel" — an open band shell with NO infill, the
  // opening is the entrance (the robot works from the forecourt through it)
  const frontDist =
    config.houseType === "office"
      ? radius * 0.45
      : config.houseType === "shelter"
        ? radius * 0.2
        : Infinity;
  // library: vertical cut plane along +x — a panorama window on the LONG
  // side of the elongated plan (x is untouched by the z-elongation above)
  const sideFrontDist = config.houseType === "library" ? radius * 0.4 : Infinity;

  // build plates for vertices above the cut
  const vertToPlate = new Map<number, number>();
  const plates: Plate[] = [];

  mesh.verts.forEach((v, vi) => {
    if (v.y < cutY) return;
    if (v.z > frontDist) return;
    if (v.x > sideFrontDist) return;

    const normal = norm(v);
    const fids = vertFaces.get(vi) ?? [];
    if (fids.length < 3) return;

    // sort face centroids by angle around the vertex normal
    const ref = norm(sub(faceCentroids[fids[0]], v));
    const tangentRef = norm(sub(ref, scale(normal, dot(ref, normal))));
    const bitangent = cross(normal, tangentRef);

    const sortedCorners = fids
      .map((fi) => {
        const d = sub(faceCentroids[fi], v);
        const t = dot(d, tangentRef);
        const bt = dot(d, bitangent);
        return { fi, angle: Math.atan2(bt, t) };
      })
      .sort((p, q) => p.angle - q.angle)
      .map((e) => faceCentroids[e.fi]);

    // near-full-size plates (hairline joints, no gaps); shift so the cut plane
    // sits on the ground, clamp to ground and to the office/library front plane
    const yOff = -cutY;
    const shrunk = sortedCorners.map((c) => {
      const p = add(v, scale(sub(c, v), 0.985));
      return {
        x: Math.min(p.x, sideFrontDist),
        y: Math.max(p.y + yOff, 0),
        z: Math.min(p.z, frontDist),
      };
    });

    const id = plates.length;
    vertToPlate.set(vi, id);
    plates.push({
      id,
      vertices: shrunk,
      centroid: { x: v.x, y: Math.max(v.y + yOff, 0.01), z: v.z },
      normal,
      ring: 0,
      neighbors: [],
      material: "wood",
      isDoor: false,
    });
  });

  // neighbors (only among kept plates)
  for (const [vi, plateId] of vertToPlate) {
    const plate = plates[plateId];
    for (const nvi of vertNeighbors.get(vi) ?? []) {
      const np = vertToPlate.get(nvi);
      if (np !== undefined) plate.neighbors.push(np);
    }
  }

  const rings = assignRings(plates, radius * 0.08);

  // door: the ring-0 plate nearest doorAngle + the plate directly above it.
  // The shelter gets NO door — its open front IS the entrance.
  const doorDir = { x: Math.sin(doorAngle), y: 0, z: Math.cos(doorAngle) };
  if (config.houseType !== "shelter") {
    const ring0 = plates.filter((p) => p.ring === 0);
    const doorPlate = ring0.reduce((best, p) =>
      dot(norm({ x: p.centroid.x, y: 0, z: p.centroid.z }), doorDir) >
      dot(norm({ x: best.centroid.x, y: 0, z: best.centroid.z }), doorDir)
        ? p
        : best
    );
    // entrance opening: two plates high (ring 0 + the one above) — stays open
    // as the robot's exit passage; a straight vertical portal (dormer) is
    // installed in front of it afterwards. Curved plates can't be fitted from
    // outside.
    doorPlate.isDoor = true;
    doorPlate.material = "glass";
    const above = doorPlate.neighbors
      .map((n) => plates[n])
      .filter((p) => p.ring === 1)
      .sort(
        (a, b) =>
          dot(norm({ x: b.centroid.x, y: 0, z: b.centroid.z }), doorDir) -
          dot(norm({ x: a.centroid.x, y: 0, z: a.centroid.z }), doorDir)
      )[0];
    if (above) {
      above.isDoor = true;
      above.material = "glass";
    }
  }

  // glass plates: deterministic, south-biased (toward doorAngle+PI is "garden side")
  const candidates = plates.filter((p) => !p.isDoor && p.ring >= 1);
  const glassCount = Math.round(candidates.length * glassRatio);
  const scored = candidates
    .map((p) => {
      const southness = dot(norm({ x: p.centroid.x, y: 0, z: p.centroid.z }), doorDir);
      return { p, score: seededHash(seed, p.id) * 0.6 + (southness + 1) * 0.2 };
    })
    .sort((a, b) => b.score - a.score);
  for (let i = 0; i < glassCount && i < scored.length; i++) {
    scored[i].p.material = "glass";
  }

  // bill of materials
  const woodPlates = plates.filter((p) => p.material === "wood").length;
  const glassPlates = plates.filter((p) => p.material === "glass").length;
  const totalWeightKg = Math.round(
    plates
      .reduce((sum, p) => {
        const area = polygonArea(p.vertices, p.centroid);
        return sum + area * (p.material === "wood" ? 17 : 25); // kg/m²: 50mm beech ply vs glass
      }, 0)
  );

  let glassFront: GlassFront | undefined;
  if (config.houseType === "office") {
    const dist = radius * 0.45;
    glassFront = { dist, rc: Math.sqrt(radius * radius - dist * dist) };
  }

  let sideGlassFront: GlassFront | undefined;
  if (config.houseType === "library") {
    sideGlassFront = {
      dist: sideFrontDist,
      rc: Math.sqrt(radius * radius - sideFrontDist * sideFrontDist),
    };
  }

  const floorSlabY =
    config.houseType === "library" ? Math.round(radius * 0.42 * 10) / 10 : undefined;

  return {
    config,
    plates,
    rings,
    bom: { woodPlates, glassPlates, totalWeightKg },
    glassFront,
    sideGlassFront,
    floorSlabY,
  };
}
