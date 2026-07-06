"use client";

import { useSimStore } from "@/lib/store";
import { VERGABE_BANDS } from "@/lib/vergabe/bands";
import { deriveVergabe } from "@/lib/vergabe/derive";
import { Bundesland, VergabeBand } from "@/lib/vergabe/types";
import { TYPE_BUDGET } from "@/lib/shell/generate";
import { HouseType } from "@/lib/shell/types";
import styles from "./ProcurementSection.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const LAND_LABELS: { key: Bundesland; label: string }[] = [
  { key: "berlin", label: "Berlin" },
  { key: "brandenburg", label: "Brandenburg" },
];

// inverse of grossBudgetToNetConstructionValue (net = gross/1.19*0.92)
const NET_TO_GROSS = 1.19 / 0.92;

/** The gross budget that best targets this band, clamped to the typology's
 * own realistic range. Always clickable — for typologies whose budget range
 * never reaches a given band (e.g. a Weather Shelter can't reach "EU-weit"),
 * this just moves the slider as close as the type allows, which is itself
 * the honest answer ("this typology never triggers that procedure"). */
function grossBudgetForBand(
  band: VergabeBand,
  lowerBoundNet: number,
  houseType: HouseType
): number {
  const targetNet =
    band.upToNet === Infinity ? lowerBoundNet * 1.2 : (lowerBoundNet + band.upToNet) / 2;
  const range = TYPE_BUDGET[houseType];
  const clampedGross = Math.min(range.max, Math.max(range.min, targetNet * NET_TO_GROSS));
  return Math.round(clampedGross / range.step) * range.step;
}

/**
 * Public-procurement simulation: reads type + budget from the shared sim
 * store (no duplicate controls) and shows which Vergabeverfahren the
 * configured building would trigger under German procurement law.
 */
export default function ProcurementSection() {
  const budget = useSimStore((s) => s.budget);
  const bundesland = useSimStore((s) => s.bundesland);
  const houseType = useSimStore((s) => s.houseType);
  const setBundesland = useSimStore((s) => s.setBundesland);
  const setBudget = useSimStore((s) => s.setBudget);

  const result = deriveVergabe(budget, bundesland);
  const activeIndex = VERGABE_BANDS.findIndex((b) => b.id === result.band.id);

  return (
    <section id="procurement" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <div>
            <h2 className={styles.heading}>Procurement Simulation</h2>
            <p className={styles.intro}>
              If this building were publicly commissioned, its budget would determine
              which award procedure (<em>Vergabeverfahren</em>) German procurement law
              requires — reacting live to the configuration below.
            </p>
          </div>

          <div className={styles.landToggle}>
            <span className={styles.landLabel}>State (Land)</span>
            <div className={styles.landBtns}>
              {LAND_LABELS.map((l) => (
                <button
                  key={l.key}
                  className={`${styles.landBtn} ${bundesland === l.key ? styles.landActive : ""}`}
                  onClick={() => setBundesland(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* procedure ladder — click a band to jump the shared budget there */}
        <div className={styles.ladder}>
          {VERGABE_BANDS.map((b, i) => {
            const lowerBoundNet = i === 0 ? 0 : VERGABE_BANDS[i - 1].upToNet;
            const jumpTo = grossBudgetForBand(b, lowerBoundNet, houseType);
            return (
              <button
                key={b.id}
                type="button"
                title={`Set budget to ${euro(jumpTo)}`}
                onClick={() => setBudget(jumpTo)}
                className={`${styles.pill} ${i === activeIndex ? styles.pillActive : ""} ${i < activeIndex ? styles.pillPassed : ""}`}
              >
                <span className={styles.pillName}>{b.nameDe}</span>
                <span className={styles.pillGloss}>{b.nameEn}</span>
                <span className={styles.pillCap}>
                  {b.upToNet === Infinity ? "above" : `≤ ${euro(b.upToNet)}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* active band detail */}
        <div className={styles.detailCard}>
          <div className={styles.detailHead}>
            <span className={styles.detailTerm}>{result.band.nameDe}</span>
            <span className={styles.detailGloss}>— {result.band.nameEn}</span>
          </div>
          <p className={styles.detailExplanation}>{result.band.explanation}</p>
          <div className={styles.detailMeta}>
            <div>
              <span>Statutory reference</span>
              <strong>{result.band.reference}</strong>
            </div>
            <div>
              <span>Indicative duration</span>
              <strong>{result.band.durationRange}</strong>
            </div>
            <div>
              <span>Net construction value</span>
              <strong>{euro(result.budgetNet)}</strong>
            </div>
          </div>

          <div className={styles.obligations}>
            <span className={styles.obligationsTitle}>
              {result.landObligation.actName} — additional {LAND_LABELS.find((l) => l.key === bundesland)?.label} obligations
            </span>
            <ul>
              {result.landObligation.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className={styles.timelineNote}>
          This procedure runs <strong>before</strong> construction can start — its
          duration adds to, not overlaps with, the build timeline shown below.
        </p>

        <p className={styles.disclaimer}>
          Indicative, educational simulation — not legal advice. Thresholds as of
          July&nbsp;2026 (Vergabebeschleunigungsgesetz, EU works threshold 2026/2027).
          Net construction value approximated from the gross budget above (÷1.19 VAT,
          8% planning share removed); real net-value assessment follows VgV/VOB/A
          contract-splitting rules.
        </p>

        <p className={styles.credit}>
          Procurement simulation developed in collaboration with{" "}
          <a href="https://meilestn.de/" target="_blank" rel="noopener noreferrer">
            <strong>Meile + Stein</strong>
          </a>
          .
        </p>
      </div>
    </section>
  );
}
