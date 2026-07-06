"use client";

import dynamic from "next/dynamic";
import BuildHUD from "@/components/ui/BuildHUD";
import Datasheet from "@/components/ui/Datasheet";
import Hero from "@/components/ui/Hero";
import ProcurementSection from "@/components/ui/ProcurementSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import styles from "./page.module.css";

const Scene3D = dynamic(() => import("@/components/scene/Scene3D"), { ssr: false });

export default function HomePage() {
  return (
    <main className={styles.main}>
      <Hero />

      <div className={styles.pageWrap}>
      {/* --- Split: controls left, 3D right (configure + build) --- */}
      <div className={styles.split}>
        <aside className={styles.leftCol}>
          <BuildHUD />
        </aside>

        <section className={styles.simSection}>
          <ErrorBoundary>
            <Scene3D />
          </ErrorBoundary>
        </section>
      </div>

      <div className={styles.caveatCard}>
        <p>
          <strong>This is an experiment in progress: </strong>
          a WebGL simulation, not an engineering or legal tool. It (still)
          makes no claim to accuracy.
        </p>
      </div>

      <ProcurementSection />

      {/* --- Info --- */}
      <section id="info" className={styles.infoSection}>
        <div className={styles.infoInner}>
          <h2>The Idea</h2>
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
                don&rsquo;t: park shelters, visitor and tourism offices, community rooms,
                off-grid and disaster-relief structures — small-to-medium public buildings
                with one open function, not room-partitioned floor plans. Which is exactly
                why this simulation models a shelter, an office and a library rather than
                a private home.
              </p>
            </div>
          </div>

          <h2>How the simulation works</h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <h3>Parametric design</h3>
              <p>
                Typology + budget deterministically generate the building: Goldberg
                geometry (hexagons/pentagons as the dual of a geodesic icosahedron),
                glazing ratio, door, bill of materials and costs. Same input → same building.
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
                Tracked mobile robot at realistic scale (~3.5 m reach), inverse kinematics
                in real time. It can&rsquo;t cover the shell from one spot, so it
                repositions: per plate it drives to the central depot, picks, CNC-mills,
                then drives to the work station nearest the target and places. When the
                shell is complete, it drives out through the door opening.
              </p>
            </div>
          </div>

          <h2>The robot: In-situ Fabricator</h2>
          <p>
            The machine in this simulation is modeled after the{" "}
            <a
              href="https://gramaziokohler.arch.ethz.ch/web/e/forschung/324.html"
              target="_blank"
              rel="noreferrer"
            >
              <strong>In-situ Fabricator</strong>
            </a>{" "}
            developed at ETH Zurich (NCCR Digital Fabrication): a tracked, self-navigating
            construction robot — an industrial arm on crawler tracks with on-board power
            and control, built to fabricate directly on the construction site rather than
            in a factory. It proved the concept in projects like Mesh Mould and the DFAB
            HOUSE, where it built full-scale load-bearing walls on site.
          </p>
          <p>
            The simulation now works the way the real machine does: it{" "}
            <strong>repositions</strong> — driving between a handful of work stations
            inside the footprint, because its arm can&rsquo;t cover the whole shell from
            one spot. Two honest gaps remain: the original IF carries roughly 40&nbsp;kg
            at 2.55&nbsp;m reach — our beech plates weigh 50–80&nbsp;kg, so a real
            deployment would need the next payload class (or two robots sharing the
            load). And the telescoping vertical lift column is a concept extension.
            Both are engineering steps, not research questions — which is exactly what
            makes on-site robotic assembly feel close.
          </p>

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
      </div>
    </main>
  );
}
