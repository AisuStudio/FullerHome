# FullerHome

**On-Site Robotic Shell Construction Concept / WebGL Experiment**

A browser simulation of a robot building a self-supporting timber plate shell
directly on site — inspired by the [Landesgartenschau Exhibition Hall 2014](https://www.itke.uni-stuttgart.de/de/forschung/realisierte_projekte/landesgartenschau-exhibition-hall-2014/)
(ICD/ITKE University of Stuttgart). Instead of factory prefabrication, raw plates
are delivered, CNC-milled on the spot and assembled plate by plate: the
construction site becomes the factory.

- **Parametric design** — house type (Igloo / Panorama / Loft) + budget generate
  the building deterministically: Goldberg plate geometry, glazing, bill of
  materials, cost and time estimates
- **Bottom-up build sequencing** — a plate is only placed if it touches the
  foundation or already-built neighbors; no floating parts, validated in `scripts/check-shell.ts`
- **Robot kinematics** — articulated arm (shoulder + elbow IK) on a growing mast;
  per plate: pick → CNC mill → swing in → place; exits on a rail when done

## Stack

Next.js · three.js · React Three Fiber · Zustand

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npx tsx scripts/check-shell.ts   # data-core sanity checks
```
