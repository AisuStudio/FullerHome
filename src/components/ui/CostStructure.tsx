"use client";

import { useSimStore } from "@/lib/store";
import styles from "./CostStructure.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const pct = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toFixed(1).replace(/\.0$/, "")}%` : "—";

/** Bar lengths are qualitative (range midpoints of the "Simulation vs.
 * reality" table), scaled against a ~12-month total. The striped tail on the
 * permit bar is the named buffer for authority queries. */
const TAKT_BARS = [
  { label: "Permit & procurement", range: "3–12 months", fill: 38, buffer: 25 },
  { label: "Foundation + utilities", range: "3–4 weeks", fill: 7, buffer: 0 },
  { label: "Shell (milling ∥ assembly)", range: "1–2 weeks", fill: 3, buffer: 0 },
  { label: "Envelope + windows", range: "1–2 weeks", fill: 3, buffer: 0 },
  { label: "Interior fit-out", range: "8–14 weeks", fill: 21, buffer: 0 },
];

/**
 * DIN 276 view of the live cost model (same numbers as the datasheet,
 * grouped the way a German cost plan groups them) + a takt plan with the
 * permit buffer made visible. Presentation only — the cost model itself
 * is unchanged.
 */
export default function CostStructure() {
  const costs = useSimStore((s) => s.costs);

  const building = costs.wood + costs.glass + costs.foundation + costs.fitout;
  const groups = [
    { label: "KG 300/400 — Building works (shell, glazing, foundation, fit-out)", value: building },
    { label: "KG 400 — Services core (utilities)", value: costs.utilities },
    { label: "KG 390 — Site setup (robot deployment)", value: costs.robot },
    { label: "KG 700 — Planning & permits (8%)", value: costs.planning },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.col}>
        <h3 className={styles.colHead}>Cost structure, DIN 276 view</h3>
        <p className={styles.colSub}>
          The live cost model from the simulation, grouped the way a German cost
          plan (DIN&nbsp;276) groups it — reacts to the typology and budget
          configured on the simulation page.
        </p>
        {groups.map((g) => (
          <div key={g.label} className={styles.kgRow}>
            <span className={styles.kgLabel}>{g.label}</span>
            <span className={styles.kgVal}>
              {euro(g.value)} · {pct(g.value, costs.total)}
            </span>
          </div>
        ))}
        <div className={`${styles.kgRow} ${styles.kgTotal}`}>
          <span className={styles.kgLabel}>Total</span>
          <span className={styles.kgVal}>{euro(costs.total)}</span>
        </div>
        <p className={styles.note}>
          A real public budget would add a <strong>named risk buffer</strong> (~5–8%)
          on top — deliberately visible as its own line, not hidden inside the
          items (Lean principle). Not included in the total above.
        </p>
      </div>

      <div className={styles.col}>
        <h3 className={styles.colHead}>Takt plan with a visible permit buffer</h3>
        <p className={styles.colSub}>
          Same durations as the &ldquo;Simulation vs. reality&rdquo; table on the
          About page — the striped block is the named buffer for authority queries
          and resubmissions, planned from day one.
        </p>
        {TAKT_BARS.map((b) => (
          <div key={b.label} className={styles.barRow}>
            <div className={styles.barLabel}>
              <span>{b.label}</span>
              <span className={styles.barRange}>{b.range}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${b.fill}%` }} />
              {b.buffer > 0 && (
                <div className={styles.barBuffer} style={{ width: `${b.buffer}%`, left: `${b.fill}%` }} />
              )}
            </div>
          </div>
        ))}
        <p className={styles.note}>
          Bar lengths are indicative (range midpoints). Permit and procurement can
          overlap each other, but neither overlaps construction.
        </p>
      </div>
    </div>
  );
}
