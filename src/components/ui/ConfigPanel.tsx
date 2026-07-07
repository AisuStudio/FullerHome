"use client";

import { useSimStore } from "@/lib/store";
import { TYPE_BUDGET, buildingDims } from "@/lib/shell/generate";
import { HouseType } from "@/lib/shell/types";
import { Locale } from "@/lib/i18n/locale";
import { houseTypesList } from "@/lib/i18n/houseTypes";
import styles from "./ConfigPanel.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const STRINGS: Record<
  Locale,
  {
    commissioningBody: string;
    budget: string;
    floorArea: string;
    footprint: string;
    height: string;
    plates: string;
    shellRobot: string;
    fitOut: string;
    timberShell: string;
    glazing: string;
    foundation: string;
    interiorFitOut: string;
    utilities: string;
    robot: string;
    planning: string;
    total: string;
    note: string;
    day: string;
    days: string;
    wks: string;
  }
> = {
  en: {
    commissioningBody: "Commissioning body:",
    budget: "Budget",
    floorArea: "Floor area",
    footprint: "Footprint",
    height: "Height",
    plates: "Plates",
    shellRobot: "Shell (robot)",
    fitOut: "Fit-out",
    timberShell: "Timber shell",
    glazing: "Glazing",
    foundation: "Foundation",
    interiorFitOut: "Interior fit-out",
    utilities: "Utilities",
    robot: "Robot",
    planning: "Planning 8%",
    total: "Total",
    note:
      "Fixed footprint per typology; budget buys build quality — plate resolution, " +
      "glazing share, and shell/foundation/fit-out spec level. Rough 2026 estimates " +
      "for illustration, not quotes (cf. BKI construction cost data); planning & " +
      "permits at 8% of construction cost.",
    day: "day",
    days: "days",
    wks: "wks",
  },
  de: {
    commissioningBody: "Auftraggeber:",
    budget: "Budget",
    floorArea: "Nutzfläche",
    footprint: "Grundriss",
    height: "Höhe",
    plates: "Platten",
    shellRobot: "Schale (Roboter)",
    fitOut: "Innenausbau",
    timberShell: "Holzschale",
    glazing: "Verglasung",
    foundation: "Fundament",
    interiorFitOut: "Innenausbau",
    utilities: "Erschließung",
    robot: "Roboter",
    planning: "Planung 8%",
    total: "Gesamt",
    note:
      "Fester Grundriss je Typologie; das Budget kauft Baustandard — Plattenauflösung, " +
      "Verglasungsanteil und Ausstattungsniveau von Schale/Fundament/Innenausbau. Grobe " +
      "Schätzungen für 2026 zur Veranschaulichung, keine Angebote (vgl. BKI-Baukostendaten); " +
      "Planung & Genehmigungen mit 8% der Baukosten.",
    day: "Tag",
    days: "Tage",
    wks: "Wo.",
  },
};

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
export default function ConfigPanel({ locale }: { locale: Locale }) {
  const steps = useSimStore((s) => s.steps);
  const costs = useSimStore((s) => s.costs);
  const budget = useSimStore((s) => s.budget);
  const houseType = useSimStore((s) => s.houseType);
  const design = useSimStore((s) => s.design);
  const { setBudget, setHouseType } = useSimStore();
  const houseTypes = houseTypesList(locale);
  const activeType = houseTypes.find((t) => t.key === houseType)!;
  const range = TYPE_BUDGET[houseType];
  const dims = buildingDims(design);
  const t = STRINGS[locale];

  return (
    <div className={styles.config}>
      <div className={styles.typeRow}>
        {houseTypes.map((ht) => (
          <button
            key={ht.key}
            className={`${styles.typeBtn} ${houseType === ht.key ? styles.typeActive : ""}`}
            onClick={() => setHouseType(ht.key)}
          >
            <TypePreview type={ht.key} />
            <strong>{ht.label}</strong>
            <span>{ht.desc}</span>
          </button>
        ))}
      </div>

      <p className={styles.clientLine}>
        {t.commissioningBody} <strong>{activeType.client}</strong>
      </p>

      <div className={styles.budgetCol}>
        <div className={styles.budgetHeader}>
          <span className={styles.budgetLabel}>{t.budget}</span>
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
          aria-label={t.budget}
        />
        <div className={styles.rangeLabels}>
          <span>{euro(range.min)}</span>
          <span>{euro(range.max)}</span>
        </div>
      </div>

        <div className={styles.statsGrid}>
          <div className={styles.stat}><span>{t.floorArea}</span><strong>{costs.floorAreaM2} m²</strong></div>
          <div className={styles.stat}><span>{t.footprint}</span><strong>{dims.widthM} × {dims.lengthM} m</strong></div>
          <div className={styles.stat}><span>{t.height}</span><strong>{dims.heightM} m</strong></div>
          <div className={styles.stat}><span>{t.plates}</span><strong>{steps.length}</strong></div>
          <div className={styles.stat}><span>{t.shellRobot}</span><strong>~{costs.shellDays} {costs.shellDays > 1 ? t.days : t.day}</strong></div>
          <div className={styles.stat}><span>{t.fitOut}</span><strong>~{costs.fitoutWeeks} {t.wks}</strong></div>
          <div className={styles.stat}><span>{t.timberShell}</span><strong>{euro(costs.wood)}</strong></div>
          <div className={styles.stat}><span>{t.glazing}</span><strong>{euro(costs.glass)}</strong></div>
          <div className={styles.stat}><span>{t.foundation}</span><strong>{euro(costs.foundation)}</strong></div>
          <div className={styles.stat}><span>{t.interiorFitOut}</span><strong>{euro(costs.fitout)}</strong></div>
          <div className={styles.stat}><span>{t.utilities}</span><strong>{euro(costs.utilities)}</strong></div>
          <div className={styles.stat}><span>{t.robot}</span><strong>{euro(costs.robot)}</strong></div>
          <div className={styles.stat}><span>{t.planning}</span><strong>{euro(costs.planning)}</strong></div>
          <div className={`${styles.stat} ${styles.statTotal}`}>
            <span>{t.total}</span>
            <strong className={costs.total > budget ? styles.overBudget : ""}>{euro(costs.total)}</strong>
          </div>
        </div>

      <p className={styles.note}>{t.note}</p>
    </div>
  );
}
