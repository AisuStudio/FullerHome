# FullerHome

**On-Site Robotic Shell Construction Concept / WebGL Experiment**

A browser simulation of a robot building a self-supporting timber plate shell
directly on site — inspired by the [Landesgartenschau Exhibition Hall 2014](https://www.itke.uni-stuttgart.de/de/forschung/realisierte_projekte/landesgartenschau-exhibition-hall-2014/)
(ICD/ITKE University of Stuttgart), itself a publicly commissioned building.
Configure a public plate-shell building, then watch an on-site robot mill and
assemble it — plate by plate, bottom up. Instead of factory prefabrication,
raw plates are delivered, CNC-milled on the spot and assembled on site: the
construction site becomes the factory.

Live: https://aisustudio.github.io/FullerHome/

## What's in it

- **Public typologies** — Weather Shelter (open "Muschel" shell, no door),
  Tourism Office (glazed street front), Library (twin-lobe elongated plan with
  a long-side panorama window). Each has its own commissioning body and
  budget range; budget scales both building **size** and build **quality**
  (plate resolution, glazing share, shell/foundation/fit-out spec)
- **Parametric design** — deterministic Goldberg plate geometry (dual of a
  subdivided icosahedron), glazing, bill of materials, cost and time
  estimates — same config always produces the same building
- **Bottom-up build sequencing** — a plate is only placed if it touches the
  foundation or an already-built neighbor; no floating parts, validated in
  `scripts/check-shell.ts`
- **Repositioning robot** — modeled after the ETH Zurich In-situ Fabricator at
  realistic scale (~3.5m arm reach). It can't cover a whole shell from one
  spot, so it drives between work stations (greedy set-cover planner,
  `src/lib/shell/stations.ts`), plus a central (or forecourt, for the open
  shelter) material depot with an on-site CNC mill
- **Procurement simulation** (in collaboration with Meile + Stein) — a pure
  rule engine (`src/lib/vergabe/`) maps the configured budget to the German
  public-procurement award-procedure band (Direktauftrag → EU-weites
  Verfahren, VOB/A §3a 2026 thresholds), with Berlin/Brandenburg state
  obligations and an interactive, clickable procedure ladder

## Stack

Next.js (static export) · three.js · React Three Fiber · Zustand

## Run

```bash
npm install
npm run dev -- --port 3033      # http://localhost:3033
npm run build                    # static export to /out (GitHub Pages)

npx tsx scripts/check-shell.ts   # geometry/sequencing invariants
npx tsx scripts/check-reach.ts   # every plate reachable from ≥1 robot station
npx tsx scripts/check-vergabe.ts # procurement band edges, both Länder
```

## Deploy

GitHub Pages via Actions (`.github/workflows/deploy.yml`, triggers on push to
`main`). In repo Settings → Pages, **Source must be "GitHub Actions"** (not
"Deploy from a branch") and the custom-domain field must stay empty, or the
Jekyll default build wins and serves the README instead of the app.

## Known caveats

- ITKE hero photo (`src/assets/hero.jpg`) and the exhibition-hall figure in
  the info section are © ICD/ITKE University of Stuttgart, photo Roland
  Halbe — clear reuse rights before sharing the deployed site publicly
- Cost/time figures are illustrative order-of-magnitude estimates, not quotes
  (see the disclaimers in the UI) — the site itself says so in a caveat card
  below the simulation
- No physics engine, no path planning/collision avoidance for the robot's
  drives between stations
