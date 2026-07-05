"use client";

import dynamic from "next/dynamic";
import BuildHUD from "@/components/ui/BuildHUD";
import Datasheet from "@/components/ui/Datasheet";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import styles from "./page.module.css";

const Scene3D = dynamic(() => import("@/components/scene/Scene3D"), { ssr: false });

export default function HomePage() {
  return (
    <main className={styles.main}>
      {/* --- Simulation (hero, 85% viewport) --- */}
      <section className={styles.simSection}>
        <ErrorBoundary>
          <Scene3D />
        </ErrorBoundary>
        <div className="app-shell">
          <BuildHUD />
        </div>
        <a className={styles.scrollHint} href="#info">
          Read more ↓
        </a>
      </section>

      {/* --- Info --- */}
      <section id="info" className={styles.infoSection}>
        <div className={styles.infoInner}>
          <h2>The idea</h2>
          <p>
            Inspired by the{" "}
            <a
              href="https://www.itke.uni-stuttgart.de/de/forschung/realisierte_projekte/landesgartenschau-exhibition-hall-2014/"
              target="_blank"
              rel="noreferrer"
            >
              <strong>Landesgartenschau Exhibition Hall 2014</strong>
            </a>{" "}
            in Schwäbisch Gmünd (ICD/ITKE University of Stuttgart): a self-supporting
            plate shell made of 243 unique beech plywood plates, joined by 7,600
            robotically milled finger joints — just 50&nbsp;mm thin, modeled on the
            skeleton of a sea urchin.
          </p>
          <figure className={styles.figure}>
            <img
              src="https://www.itke.uni-stuttgart.de/img/gallery/LAGA/ICD_ITKE/folie36.jpg?__scale=w:880,h:660,cx:0,cy:0,cw:800,ch:600"
              alt="Landesgartenschau Exhibition Hall 2014, Schwäbisch Gmünd — robotically fabricated beech plywood plate shell"
              loading="lazy"
            />
            <figcaption>
              Landesgartenschau Exhibition Hall 2014 · © ICD/ITKE University of Stuttgart ·
              Photo: Roland Halbe
            </figcaption>
          </figure>
          <p>
            <strong>The twist in this simulation:</strong> instead of prefabrication in a
            factory, the robot stands directly on site. Raw plates are delivered, CNC-milled
            on the spot and assembled plate by plate — the construction site becomes the
            factory. No heavy haulage, no crane logistics for oversized modules.
          </p>

          <h2>Why &ldquo;FullerHome&rdquo;?</h2>
          <p>
            The name honors <strong>Richard Buckminster Fuller</strong> (1895–1983), who
            popularized the geodesic dome in the late 1940s. Fuller&rsquo;s obsession was
            &ldquo;doing more with less&rdquo;: a sphere encloses the most volume with the
            least surface, and a geodesic lattice distributes loads so evenly that the
            structure needs no columns, no beams, no load-bearing interior walls. His
            vision went further than geometry — he imagined mass-produced,
            air-deliverable homes (the Dymaxion House) decades before anyone spoke of
            prefabrication or serial building. A robot that assembles a dome on site from
            a flat-pack of plates is arguably closer to Fuller&rsquo;s original idea than
            most things built in his lifetime.
          </p>

          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h3>Where domes shine</h3>
              <p>
                ~30% less envelope surface per m³ than a box — less material, less heat
                loss. Aerodynamic in storms and snow. Column-free span, ideal for open
                plans, workshops, greenhouses, event and community spaces. Strongest
                structure per kilogram of material we know how to build.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Where they struggle</h3>
              <p>
                Curved walls fight rectangular life: furniture, kitchens, standard
                windows and doors all assume right angles. Every plate is unique — no
                standard parts (exactly the problem robotic fabrication solves). Interior
                partitioning wastes the open span, acoustics can be lively, and resale
                markets are conservative.
              </p>
            </div>
            <div className={styles.card}>
              <h3>The sweet spot</h3>
              <p>
                Domes make most sense where their strengths matter and their weaknesses
                don&rsquo;t: studios, workshops, holiday homes, off-grid and disaster-relief
                housing, garden buildings — and in clusters, where several small domes
                form a village and each dome hosts one function instead of forcing
                room-partitions into curved geometry.
              </p>
            </div>
          </div>

          <h2>How the simulation works</h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h3>Parametric design</h3>
              <p>
                House type + budget deterministically generate the building: Goldberg
                geometry (hexagons/pentagons as the dual of a geodesic icosahedron),
                glazing ratio, door, bill of materials and costs. Same input → same house.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Build sequencing</h3>
              <p>
                A plate is only placed if it touches the foundation or already-built
                neighbors — ring by ring, bottom-up, exactly as the structural logic of a
                shell demands. No floating parts, mathematically validated.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Robot kinematics</h3>
              <p>
                Articulated arm with shoulder and elbow joints on a growing mast, inverse
                kinematics in real time. Per plate: pick → CNC mill → swing in → place.
                The crown stays open until the very end — prefab modules (stairs,
                intermediate floor) are lowered in through it.
              </p>
            </div>
          </div>

          <h2>Simulation vs. reality</h2>
          <p>
            The simulation shows pure robotic assembly time. An honest construction
            schedule looks different:
          </p>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Simulation</th>
                <th>Realistic</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Building permit</td><td>—</td><td>3–12 months</td></tr>
              <tr><td>Foundation + utilities</td><td>—</td><td>3–4 weeks (incl. curing)</td></tr>
              <tr><td>Shell (milling ∥ assembly)</td><td>1–3 days</td><td>1–2 weeks</td></tr>
              <tr><td>Weatherproof envelope + windows</td><td>—</td><td>1–2 weeks</td></tr>
              <tr><td>Interior fit-out</td><td>5–10 weeks</td><td>8–14 weeks</td></tr>
              <tr className={styles.totalRow}><td>Turnkey from groundbreaking</td><td>~6 weeks</td><td>4–6 months</td></tr>
            </tbody>
          </table>
          <p className={styles.note}>
            Biggest open questions for actual living: insulation (a 50&nbsp;mm shell
            does not meet energy codes — a real building needs an insulation layer plus
            inner shell), joint sealing, fire safety. The ITKE hall was an unheated
            exhibition space.
          </p>

          <h2>Cost model</h2>
          <p>
            Rough estimates to illustrate the parametric model, 2026 order of magnitude —
            not quotes: fabricated CLT shell ≈ €420/m² incl. milling and connectors,
            insulated glazing ≈ €650/m², interior fit-out ≈ €1,400/m² (cf. BKI
            construction cost data), utilities connection €25k flat, robot deployment
            €35k, planning &amp; permits 8%. The services core bundles power, water and
            sewage in the center of the building — short runs, no pipes inside the
            shell plates.
          </p>

          <h2>Datasheet</h2>
          <p>
            All values react live to house type and budget in the simulation above —
            change the configuration and the datasheet recalculates.
          </p>
          <Datasheet />

          <h2>Roadmap</h2>
          <ul className={styles.roadmap}>
            <li>Physics engine (Rapier) for material behavior and drop effects</li>
            <li>Insulation and inner-shell layer in the model (energy-code compliant)</li>
            <li>Module fly-in: stairs and intermediate floor through the open crown</li>
            <li>Two robots in tandem (milling and assembly separated)</li>
            <li>Bill of materials export as CNC fabrication data</li>
          </ul>

          <footer className={styles.footer}>
            <span>FullerHome — WebGL spike</span>
            <span>Next.js · three.js · React Three Fiber · Zustand</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
