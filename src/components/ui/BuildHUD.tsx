"use client";

import { useSimStore } from "@/lib/store";
import { BUDGET_MIN, BUDGET_MAX } from "@/lib/shell/generate";
import { HouseType } from "@/lib/shell/types";
import styles from "./BuildHUD.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const PHASE_LABELS: { key: string; label: string }[] = [
  { key: "planning", label: "Planning" },
  { key: "delivery", label: "Delivery" },
  { key: "building", label: "Construction" },
  { key: "done", label: "Complete" },
];

export const HOUSE_TYPES: { key: HouseType; label: string; desc: string }[] = [
  { key: "iglu", label: "Igloo", desc: "Classic dome" },
  { key: "panorama", label: "Panorama", desc: "Straight glass front" },
  { key: "loft", label: "Loft", desc: "Two levels" },
];

function TypePreview({ type }: { type: HouseType }) {
  const wood = "#B08D57";
  const glass = "rgba(160, 205, 235, 0.55)";
  if (type === "iglu") {
    return (
      <svg viewBox="0 0 64 36" width="64" height="36" aria-hidden>
        <path d="M4 34 A28 28 0 0 1 60 34 Z" fill={wood} />
        <path d="M22 34 A10 14 0 0 1 42 34 Z" fill={glass} />
        <line x1="0" y1="34" x2="64" y2="34" stroke="#66655f" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === "panorama") {
    return (
      <svg viewBox="0 0 64 36" width="64" height="36" aria-hidden>
        <path d="M4 34 A28 28 0 0 1 46 9 L46 34 Z" fill={wood} />
        <rect x="46" y="9" width="14" height="25" fill={glass} />
        <line x1="46" y1="9" x2="46" y2="34" stroke="#4a3a22" strokeWidth="1.5" />
        <line x1="53" y1="12" x2="53" y2="34" stroke="#4a3a22" strokeWidth="1" />
        <line x1="0" y1="34" x2="64" y2="34" stroke="#66655f" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 36" width="64" height="36" aria-hidden>
      <path d="M10 34 C6 20 14 3 32 3 C50 3 58 20 54 34 Z" fill={wood} />
      <line x1="14" y1="20" x2="50" y2="20" stroke="#6B4A26" strokeWidth="2" />
      <path d="M26 34 A6 9 0 0 1 38 34 Z" fill={glass} />
      <line x1="0" y1="34" x2="64" y2="34" stroke="#66655f" strokeWidth="1.5" />
    </svg>
  );
}

export default function BuildHUD() {
  const phase = useSimStore((s) => s.phase);
  const cursor = useSimStore((s) => s.cursor);
  const steps = useSimStore((s) => s.steps);
  const design = useSimStore((s) => s.design);
  const costs = useSimStore((s) => s.costs);
  const budget = useSimStore((s) => s.budget);
  const speed = useSimStore((s) => s.speed);
  const paused = useSimStore((s) => s.paused);
  const houseType = useSimStore((s) => s.houseType);
  const {
    startDelivery, startBuild, setSpeed, togglePause, reset, setCursor,
    setBudget, setHouseType,
  } = useSimStore();

  const phaseIndex = PHASE_LABELS.findIndex((p) => p.key === phase);
  const progress = steps.length > 0 ? cursor / steps.length : 0;
  const currentStep = phase === "building" && cursor < steps.length ? steps[cursor] : null;

  return (
    <>
      {/* header: project + phase timeline */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>⬡</span>
          <div>
            <h1 className={styles.title}>FullerHome</h1>
            <p className={styles.subtitle}>On-Site Robotic Shell Construction Concept / WebGL Experiment</p>
          </div>
        </div>

        <nav className={styles.timeline}>
          {PHASE_LABELS.map((p, i) => (
            <div
              key={p.key}
              className={`${styles.timelineStep} ${i === phaseIndex ? styles.active : ""} ${i < phaseIndex ? styles.completed : ""}`}
            >
              <span className={styles.timelineDot} />
              {p.label}
            </div>
          ))}
        </nav>
      </header>

      {/* stats panel */}
      <aside className={styles.stats}>
        <div className={styles.statRow}>
          <span>House type</span>
          <strong>{HOUSE_TYPES.find((t) => t.key === houseType)?.label}</strong>
        </div>
        <div className={styles.statRow}>
          <span>Plates</span>
          <strong>{cursor} / {steps.length}</strong>
        </div>
        <div className={styles.statRow}>
          <span>Wood / glass</span>
          <strong>{design.bom.woodPlates} / {design.bom.glassPlates}</strong>
        </div>
        <div className={styles.statRow}>
          <span>Weight</span>
          <strong>{(design.bom.totalWeightKg / 1000).toFixed(1)} t</strong>
        </div>
        <div className={styles.statRow}>
          <span>Rings</span>
          <strong>{currentStep ? currentStep.ring + 1 : phase === "done" ? design.rings : 0} / {design.rings}</strong>
        </div>
        {(phase === "building" || phase === "done") && (
          <div className={styles.statRow}>
            <span>Real build time</span>
            <strong>
              {(cursor * 0.3).toFixed(1)} h · day {Math.max(1, Math.ceil((cursor * 0.3) / 20))}
            </strong>
          </div>
        )}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
        </div>
      </aside>

      {/* budget configurator (planning only) */}
      {phase === "planning" && (
        <div className={styles.budgetPanel}>
          <div className={styles.typeRow}>
            {HOUSE_TYPES.map((t) => (
              <button
                key={t.key}
                className={`${styles.typeBtn} ${houseType === t.key ? styles.typeActive : ""}`}
                onClick={() => setHouseType(t.key)}
              >
                <TypePreview type={t.key} />
                <strong>{t.label}</strong>
                <span>{t.desc}</span>
              </button>
            ))}
          </div>

          <div className={styles.budgetHeader}>
            <span className={styles.budgetLabel}>Budget</span>
            <strong className={styles.budgetValue}>{euro(budget)}</strong>
          </div>
          <input
            type="range"
            className={styles.budgetSlider}
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={5000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Budget"
          />
          <div className={styles.budgetGrid}>
            <div className={styles.budgetStat}>
              <span>Floor area</span>
              <strong>{costs.floorAreaM2} m²</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Plates</span>
              <strong>{steps.length}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Shell (robot)</span>
              <strong>~{costs.shellDays} day{costs.shellDays > 1 ? "s" : ""}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Fit-out</span>
              <strong>~{costs.fitoutWeeks} wks</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Timber shell</span>
              <strong>{euro(costs.wood)}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Glazing</span>
              <strong>{euro(costs.glass)}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Foundation</span>
              <strong>{euro(costs.foundation)}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Interior fit-out</span>
              <strong>{euro(costs.fitout)}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Utilities</span>
              <strong>{euro(costs.utilities)}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Robot deployment</span>
              <strong>{euro(costs.robot)}</strong>
            </div>
            <div className={styles.budgetStat}>
              <span>Planning &amp; permits</span>
              <strong>{euro(costs.planning)}</strong>
            </div>
            <div className={`${styles.budgetStat} ${styles.budgetTotal}`}>
              <span>Total</span>
              <strong className={costs.total > budget ? styles.overBudget : ""}>
                {euro(costs.total)}
              </strong>
            </div>
          </div>
          <p className={styles.priceNote}>
            Rough 2026 estimates for illustration — not quotes. Fabricated CLT shell
            ≈ €420/m², insulated glazing ≈ €650/m², interior fit-out ≈ €1,400/m²
            (cf. BKI construction cost data), planning &amp; permits 8%.
          </p>
        </div>
      )}

      {/* controls */}
      <div className={styles.controls}>
        {phase === "planning" && (
          <button className={styles.primaryBtn} onClick={startDelivery}>
            Deliver material
          </button>
        )}
        {phase === "delivery" && (
          <button className={styles.primaryBtn} onClick={startBuild}>
            ▶ Start construction
          </button>
        )}
        {phase === "building" && (
          <>
            <button className={styles.secondaryBtn} onClick={togglePause}>
              {paused ? "▶ Resume" : "❚❚ Pause"}
            </button>
            {[1, 3, 8].map((s) => (
              <button
                key={s}
                className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ""}`}
                onClick={() => setSpeed(s)}
              >
                {s}×
              </button>
            ))}
          </>
        )}
        {phase === "done" && (
          <button className={styles.secondaryBtn} onClick={() => { reset(); setCursor(0); }}>
            ↺ Build again
          </button>
        )}
      </div>
    </>
  );
}
