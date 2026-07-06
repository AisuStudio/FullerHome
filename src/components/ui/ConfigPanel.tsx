"use client";

import { useSimStore } from "@/lib/store";
import { TYPE_BUDGET, buildingDims } from "@/lib/shell/generate";
import { HouseType } from "@/lib/shell/types";
import { HOUSE_TYPES } from "./BuildHUD";
import styles from "./ConfigPanel.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

function TypePreview({ type }: { type: HouseType }) {
  const wood = "#B08D57";
  const glass = "rgba(160, 205, 235, 0.55)";
  if (type === "shelter") {
    // shallow geodesic roof cap raised on stilts — a vehicle carport, open
    // underneath on all sides (no glazing, no walls reaching the ground)
    return (
      <svg viewBox="0 0 64 36" width="64" height="36" aria-hidden>
        <path d="M10 19 Q32 4 54 19 L54 21 Q32 8 10 21 Z" fill={wood} />
        <line x1="14" y1="20" x2="14" y2="33" stroke="#66655f" strokeWidth="2" />
        <line x1="32" y1="15" x2="32" y2="33" stroke="#66655f" strokeWidth="2" />
        <line x1="50" y1="20" x2="50" y2="33" stroke="#66655f" strokeWidth="2" />
        <line x1="0" y1="34" x2="64" y2="34" stroke="#66655f" strokeWidth="1.5" />
      </svg>
    );
  }
  if (type === "office") {
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

/** Configuration bar shown ABOVE the 3D view during planning — never covers the scene */
export default function ConfigPanel() {
  const steps = useSimStore((s) => s.steps);
  const costs = useSimStore((s) => s.costs);
  const budget = useSimStore((s) => s.budget);
  const houseType = useSimStore((s) => s.houseType);
  const design = useSimStore((s) => s.design);
  const { setBudget, setHouseType } = useSimStore();
  const activeType = HOUSE_TYPES.find((t) => t.key === houseType)!;
  const range = TYPE_BUDGET[houseType];
  const dims = buildingDims(design);

  return (
    <div className={styles.config}>
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

      <p className={styles.clientLine}>
        Commissioning body: <strong>{activeType.client}</strong>
      </p>

      <div className={styles.budgetCol}>
        <div className={styles.budgetHeader}>
          <span className={styles.budgetLabel}>Budget</span>
          <strong className={styles.budgetValue}>{euro(budget)}</strong>
        </div>
        <input
          type="range"
          className={styles.budgetSlider}
          min={range.min}
          max={range.max}
          step={range.step}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label="Budget"
        />
        <div className={styles.rangeLabels}>
          <span>{euro(range.min)}</span>
          <span>{euro(range.max)}</span>
        </div>
      </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}><span>Floor area</span><strong>{costs.floorAreaM2} m²</strong></div>
          <div className={styles.stat}><span>Footprint</span><strong>{dims.widthM} × {dims.lengthM} m</strong></div>
          <div className={styles.stat}><span>Height</span><strong>{dims.heightM} m</strong></div>
          <div className={styles.stat}><span>Plates</span><strong>{steps.length}</strong></div>
          <div className={styles.stat}><span>Shell (robot)</span><strong>~{costs.shellDays} day{costs.shellDays > 1 ? "s" : ""}</strong></div>
          <div className={styles.stat}><span>Fit-out</span><strong>~{costs.fitoutWeeks} wks</strong></div>
          <div className={styles.stat}><span>Timber shell</span><strong>{euro(costs.wood)}</strong></div>
          <div className={styles.stat}><span>Glazing</span><strong>{euro(costs.glass)}</strong></div>
          <div className={styles.stat}><span>Foundation</span><strong>{euro(costs.foundation)}</strong></div>
          <div className={styles.stat}><span>Interior fit-out</span><strong>{euro(costs.fitout)}</strong></div>
          <div className={styles.stat}><span>Utilities</span><strong>{euro(costs.utilities)}</strong></div>
          <div className={styles.stat}><span>Robot</span><strong>{euro(costs.robot)}</strong></div>
          <div className={styles.stat}><span>Planning 8%</span><strong>{euro(costs.planning)}</strong></div>
          <div className={`${styles.stat} ${styles.statTotal}`}>
            <span>Total</span>
            <strong className={costs.total > budget ? styles.overBudget : ""}>{euro(costs.total)}</strong>
          </div>
        </div>

      <p className={styles.note}>
        Fixed footprint per typology; budget buys build quality — plate resolution,
        glazing share, and shell/foundation/fit-out spec level. Rough 2026 estimates
        for illustration, not quotes (cf. BKI construction cost data); planning &amp;
        permits at 8% of construction cost.
      </p>
    </div>
  );
}
