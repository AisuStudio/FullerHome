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
// Budget model: budget (€) → shell parameters + cost breakdown.
// Rough but honest numbers: 50mm beech CLT plates ~180€/m² fabricated,
// insulated glass ~380€/m², foundation ~90€/m², robot deployment flat.
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

export const BUDGET_MIN = 150_000;
export const BUDGET_MAX = 600_000;

export function configForBudget(budget: number, houseType: HouseType): Partial<ShellConfig> {
  const t = Math.min(1, Math.max(0, (budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)));
  const base: Partial<ShellConfig> = {
    houseType,
    radius: 3.8 + t * 3.7,
    detail: budget < 260_000 ? 1 : budget < 430_000 ? 2 : 3,
    glassRatio: 0.1 + t * 0.25,
  };
  if (houseType === "panorama") {
    // straight glass front replaces most shell glazing; door moves to the side
    base.glassRatio = 0.05 + t * 0.08;
    base.doorAngle = 2.4;
  }
  if (houseType === "loft") {
    // taller-than-hemisphere bulb for two levels
    base.cutRatio = -0.32;
    base.radius = 4.0 + t * 3.6;
  }
  return base;
}

export function computeCosts(design: ShellDesign): CostBreakdown {
  let woodArea = 0;
  let glassArea = 0;
  for (const p of design.plates) {
    const area = polygonArea(p.vertices, p.centroid);
    if (p.material === "glass") glassArea += area;
    else woodArea += area;
  }
  // panorama: flat glazed facade (semicircular area at the cut plane)
  if (design.glassFront) {
    glassArea += (Math.PI / 2) * design.glassFront.rc * design.glassFront.rc;
  }

  const r = design.config.radius;
  let floorAreaM2 = Math.PI * r * r * 0.85; // usable footprint
  // loft: add the second-floor slab area
  if (design.floorSlabY !== undefined) {
    const r2sq = r * r - design.floorSlabY * design.floorSlabY;
    if (r2sq > 0) floorAreaM2 += Math.PI * r2sq * 0.8;
  }

  const plateCount = design.plates.length;
  // fabricated + installed rates (not raw material): CLT shell incl. milling,
  // connectors and weatherproofing layer; insulated safety glazing; slab-on-grade
  const wood = Math.round(woodArea * 420);
  const glass = Math.round(glassArea * 650);
  const foundation = Math.round(Math.PI * r * r * 0.85 * 180);
  const fitout = Math.round(floorAreaM2 * 1_400); // floors, bath, kitchen, electrics, HVAC
  const utilities = 25_000; // grid/water/sewage connection + central services core
  const slab = design.floorSlabY !== undefined
    ? Math.round((floorAreaM2 - Math.PI * r * r * 0.85) * 380)
    : 0;
  const robot = 35_000;
  const subtotal = wood + slab + glass + foundation + fitout + utilities + robot;
  const planning = Math.round(subtotal * 0.08); // architect, structural, permits

  // 0.3h per plate: pick + on-site CNC milling + place
  const buildHours = Math.round(plateCount * 0.3 + (design.glassFront ? 10 : 0));
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

  // panorama: vertical cut plane along +z for the flat glass facade
  const frontDist = config.houseType === "panorama" ? radius * 0.45 : Infinity;

  // build plates for vertices above the cut
  const vertToPlate = new Map<number, number>();
  const plates: Plate[] = [];

  mesh.verts.forEach((v, vi) => {
    if (v.y < cutY) return;
    if (v.z > frontDist) return;

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
    // sits on the ground, clamp to ground and to the panorama front plane
    const yOff = -cutY;
    const shrunk = sortedCorners.map((c) => {
      const p = add(v, scale(sub(c, v), 0.985));
      return {
        x: p.x,
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

  // door: the ring-0 plate nearest doorAngle + the plate directly above it
  const doorDir = { x: Math.sin(doorAngle), y: 0, z: Math.cos(doorAngle) };
  const ring0 = plates.filter((p) => p.ring === 0);
  const doorPlate = ring0.reduce((best, p) =>
    dot(norm({ x: p.centroid.x, y: 0, z: p.centroid.z }), doorDir) >
    dot(norm({ x: best.centroid.x, y: 0, z: best.centroid.z }), doorDir)
      ? p
      : best
  );
  // entrance opening: two plates high (ring 0 + the one above) — stays open as
  // the robot's exit passage; a straight vertical portal (dormer) is installed
  // in front of it afterwards. Curved plates can't be fitted from outside.
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
  if (config.houseType === "panorama") {
    const dist = radius * 0.45;
    glassFront = { dist, rc: Math.sqrt(radius * radius - dist * dist) };
  }

  const floorSlabY =
    config.houseType === "loft" ? Math.round(radius * 0.42 * 10) / 10 : undefined;

  return {
    config,
    plates,
    rings,
    bom: { woodPlates, glassPlates, totalWeightKg },
    glassFront,
    floorSlabY,
  };
}
