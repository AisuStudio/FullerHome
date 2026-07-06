"use client";

import CostStructure from "./CostStructure";
import styles from "./DeliverySection.module.css";

const TAKTS = [
  {
    idx: "Takt 01",
    title: "Site & needs analysis",
    text: "Plot, utilities access, setback areas, zoning check, first rough costs.",
    tag: "Pull trigger: plot data",
  },
  {
    idx: "Takt 02",
    title: "Permit & procurement planning",
    text: "Permit application, structural verification, early alignment with the building authority — for public clients, the award procedure (above) runs here.",
    tag: "Critical path",
  },
  {
    idx: "Takt 03",
    title: "Material & robot mobilization",
    text: "Plate blanks ordered, robot and depot logistics scheduled while permits are pending. On-site milling means there is no factory prefab to wait for.",
    tag: "Parallelized",
  },
  {
    idx: "Takt 04",
    title: "On-site takt assembly",
    text: "The robot mills and places plate by plate to a weekly last-planner schedule, with a quality gate per takt.",
    tag: "PPC measured",
  },
  {
    idx: "Takt 05",
    title: "Acceptance & handover",
    text: "Final inspection (Abnahme), completion notice, documentation handover to the operator.",
    tag: "Milestone",
  },
];

const PRINCIPLES = [
  {
    tag: "Pull principle",
    title: "Scheduled backwards from handover",
    text: "The sequence is planned from the desired opening date backwards — permits and procurement start early enough that they never become the bottleneck.",
  },
  {
    tag: "Last Planner System",
    title: "Weekly release with a PPC metric",
    text: "Each takt is released week by week; the Percent-Plan-Complete figure makes slippage visible immediately instead of at the end date.",
  },
  {
    tag: "Buffer management",
    title: "Visible buffers, not hidden padding",
    text: "Buffers for permits, weather and supply chains are named blocks of their own — not silently priced into individual tasks.",
  },
  {
    tag: "Takt planning",
    title: "A steady rhythm on site",
    text: "Assembly follows fixed takt times per shell ring, so robot, crew and logistics run at an even, predictable utilization.",
  },
];

const DEVIATIONS = [
  {
    title: "Risk buffers instead of after-the-fact math",
    text: "Permit and change-order buffers are priced in from day one — they are not “discovered” when a problem hits.",
  },
  {
    title: "Early warning via PPC and milestone status",
    text: "Delays in permitting or fabrication show up in the weekly numbers, not at the planned completion date.",
  },
  {
    title: "Structured change orders",
    text: "Extra costs from authority conditions or design changes become documented change orders (Nachträge) with cause, cost and schedule impact.",
  },
  {
    title: "Milestone-based payments",
    text: "Payments attach to verified milestones — permit granted, shell complete — so client and builder share an interest in realistic dates.",
  },
  {
    title: "Early authority involvement",
    text: "Pre-application meetings with the building authority are the single biggest lever against permit-stage delays for unusual shapes like a dome.",
  },
];

/**
 * How a real FullerHome project would be run: Lean takts, principles and
 * deviation handling. Content adapted from the Meile + Stein design draft,
 * reframed from marketing copy to concept-study tone.
 */
export default function DeliverySection() {
  return (
    <section id="delivery" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Lean Project Delivery</h2>
        <p className={styles.intro}>
          If FullerHome were a real delivery operation, the project would not run as
          five classical planning phases but as <strong>five takts</strong> — short,
          clearly bounded stages with defined handover criteria, in the spirit of
          Lean Construction. Permits, costs and dates are part of the project
          structure from the start, not a risk appended later.
        </p>

        <div className={styles.taktGrid}>
          {TAKTS.map((t) => (
            <div key={t.idx} className={styles.takt}>
              <span className={styles.taktIdx}>{t.idx}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <span className={styles.taktTag}>{t.tag}</span>
            </div>
          ))}
        </div>

        <CostStructure />

        <div className={styles.principleGrid}>
          {PRINCIPLES.map((p) => (
            <div key={p.tag} className={styles.principle}>
              <span className={styles.principleTag}>{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>

        <h3 className={styles.devHead}>When budget or schedule slips anyway</h3>
        <p className={styles.devIntro}>
          Overruns can rarely be avoided entirely — least of all in procedures that
          depend on authorities. What can be designed is a process that surfaces
          deviations early instead of excusing them late:
        </p>
        <ol className={styles.devList}>
          {DEVIATIONS.map((d) => (
            <li key={d.title}>
              <strong>{d.title}.</strong> {d.text}
            </li>
          ))}
        </ol>

        <p className={styles.credit}>
          Project-delivery framing developed with{" "}
          <a href="https://meilestn.de/" target="_blank" rel="noopener noreferrer">
            <strong>Meile + Stein</strong>
          </a>
          .
        </p>
      </div>
    </section>
  );
}
