"use client";

import { useSimStore } from "@/lib/store";
import { Locale } from "@/lib/i18n/locale";
import styles from "./CostStructure.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const pct = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toFixed(1).replace(/\.0$/, "")}%` : "—";

/** Bar lengths are qualitative (range midpoints of the "Simulation vs.
 * reality" table), scaled against a ~12-month total. The striped tail on the
 * permit bar is the named buffer for authority queries. */
const TAKT_BARS: Record<Locale, { label: string; range: string; fill: number; buffer: number }[]> = {
  en: [
    { label: "Permit & procurement", range: "3–12 months", fill: 38, buffer: 25 },
    { label: "Foundation + utilities", range: "3–4 weeks", fill: 7, buffer: 0 },
    { label: "Shell (milling ∥ assembly)", range: "1–2 weeks", fill: 3, buffer: 0 },
    { label: "Envelope + windows", range: "1–2 weeks", fill: 3, buffer: 0 },
    { label: "Interior fit-out", range: "8–14 weeks", fill: 21, buffer: 0 },
  ],
  de: [
    { label: "Genehmigung & Vergabe", range: "3–12 Monate", fill: 38, buffer: 25 },
    { label: "Fundament + Erschließung", range: "3–4 Wochen", fill: 7, buffer: 0 },
    { label: "Schale (Fräsen ∥ Montage)", range: "1–2 Wochen", fill: 3, buffer: 0 },
    { label: "Hülle + Fenster", range: "1–2 Wochen", fill: 3, buffer: 0 },
    { label: "Innenausbau", range: "8–14 Wochen", fill: 21, buffer: 0 },
  ],
};

const STRINGS: Record<
  Locale,
  {
    heading1: string;
    sub1: string;
    total: string;
    note1Strong: string;
    note1Rest: string;
    heading2: string;
    sub2: string;
    note2: string;
    kgBuilding: string;
    kgServices: string;
    kgSite: string;
    kgPlanning: string;
  }
> = {
  en: {
    heading1: "Cost structure, DIN 276 view",
    sub1:
      "The live cost model from the simulation, grouped the way a German cost " +
      "plan (DIN 276) groups it — reacts to the typology and budget " +
      "configured on the simulation page.",
    total: "Total",
    note1Strong: "named risk buffer",
    note1Rest:
      " (~5–8%) on top — deliberately visible as its own line, not hidden inside " +
      "the items (Lean principle). Not included in the total above.",
    heading2: "Takt plan with a visible permit buffer",
    sub2:
      "Same durations as the “Simulation vs. reality” table on the " +
      "About page — the striped block is the named buffer for authority queries " +
      "and resubmissions, planned from day one.",
    note2:
      "Bar lengths are indicative (range midpoints). Permit and procurement can " +
      "overlap each other, but neither overlaps construction.",
    kgBuilding: "KG 300/400 — Building works (shell, glazing, foundation, fit-out)",
    kgServices: "KG 400 — Services core (utilities)",
    kgSite: "KG 390 — Site setup (robot deployment)",
    kgPlanning: "KG 700 — Planning & permits (8%)",
  },
  de: {
    heading1: "Kostenstruktur, Ansicht nach DIN 276",
    sub1:
      "Das Live-Kostenmodell aus der Simulation, gruppiert wie ein deutscher " +
      "Kostenplan (DIN 276) es gruppiert — reagiert auf die Typologie und das " +
      "Budget der Simulationsseite.",
    total: "Gesamt",
    note1Strong: "benannten Risikopuffer",
    note1Rest:
      " (~5–8%) obendrauf — bewusst als eigene Zeile sichtbar, nicht in den " +
      "Positionen versteckt (Lean-Prinzip). Nicht in der obigen Summe enthalten.",
    heading2: "Taktplan mit sichtbarem Genehmigungspuffer",
    sub2:
      "Gleiche Dauern wie die Tabelle „Simulation vs. Realität“ auf der " +
      "About-Seite — der schraffierte Block ist der benannte Puffer für " +
      "Behördenrückfragen und Nachreichungen, von Anfang an eingeplant.",
    note2:
      "Balkenlängen sind indikativ (Bereichsmittelwerte). Genehmigung und Vergabe " +
      "können sich überlappen, aber keines von beiden überlappt den Bau.",
    kgBuilding: "KG 300/400 — Bauwerk (Schale, Verglasung, Fundament, Innenausbau)",
    kgServices: "KG 400 — Versorgungskern (Erschließung)",
    kgSite: "KG 390 — Baustelleneinrichtung (Robotereinsatz)",
    kgPlanning: "KG 700 — Planung & Genehmigungen (8%)",
  },
};

/**
 * DIN 276 view of the live cost model (same numbers as the datasheet,
 * grouped the way a German cost plan groups them) + a takt plan with the
 * permit buffer made visible. Presentation only — the cost model itself
 * is unchanged.
 */
export default function CostStructure({ locale }: { locale: Locale }) {
  const costs = useSimStore((s) => s.costs);
  const t = STRINGS[locale];

  const building = costs.wood + costs.glass + costs.foundation + costs.fitout;
  const groups = [
    { label: t.kgBuilding, value: building },
    { label: t.kgServices, value: costs.utilities },
    { label: t.kgSite, value: costs.robot },
    { label: t.kgPlanning, value: costs.planning },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.col}>
        <h3 className={styles.colHead}>{t.heading1}</h3>
        <p className={styles.colSub}>{t.sub1}</p>
        {groups.map((g) => (
          <div key={g.label} className={styles.kgRow}>
            <span className={styles.kgLabel}>{g.label}</span>
            <span className={styles.kgVal}>
              {euro(g.value)} · {pct(g.value, costs.total)}
            </span>
          </div>
        ))}
        <div className={`${styles.kgRow} ${styles.kgTotal}`}>
          <span className={styles.kgLabel}>{t.total}</span>
          <span className={styles.kgVal}>{euro(costs.total)}</span>
        </div>
        <p className={styles.note}>
          {locale === "de" ? "Ein reales öffentliches Budget würde einen " : "A real public budget would add a "}
          <strong>{t.note1Strong}</strong>
          {t.note1Rest}
        </p>
      </div>

      <div className={styles.col}>
        <h3 className={styles.colHead}>{t.heading2}</h3>
        <p className={styles.colSub}>{t.sub2}</p>
        {TAKT_BARS[locale].map((b) => (
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
        <p className={styles.note}>{t.note2}</p>
      </div>
    </div>
  );
}
