"use client";

import Link from "next/link";
import { useSimStore } from "@/lib/store";
import { VERGABE_BANDS } from "@/lib/vergabe/bands";
import { deriveVergabe } from "@/lib/vergabe/derive";
import { Bundesland, VergabeBand } from "@/lib/vergabe/types";
import { TYPE_BUDGET } from "@/lib/shell/generate";
import { HouseType } from "@/lib/shell/types";
import { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import { HOUSE_TYPE_LABELS } from "@/lib/i18n/houseTypes";
import MSCallout from "./MSCallout";
import styles from "./ProcurementSection.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const LAND_LABELS: { key: Bundesland; label: string }[] = [
  { key: "berlin", label: "Berlin" },
  { key: "brandenburg", label: "Brandenburg" },
];

// inverse of grossBudgetToNetConstructionValue (net = gross/1.19*0.92)
const NET_TO_GROSS = 1.19 / 0.92;

const STRINGS: Record<
  Locale,
  {
    heading: string;
    intro1: string;
    introChangeLink: string;
    state: string;
    above: string;
    upTo: string;
    statutoryReference: string;
    indicativeDuration: string;
    netConstructionValue: string;
    additionalObligations: string;
    timelineNote1: string;
    timelineNote2: string;
    disclaimer: string;
  }
> = {
  en: {
    heading: "Procurement Simulation",
    intro1:
      "If this building were publicly commissioned, its budget would determine " +
      "which award procedure (Vergabeverfahren) German procurement law requires. " +
      "Configured building:",
    introChangeLink: "change it in the simulation",
    state: "State (Land)",
    above: "above",
    upTo: "≤",
    statutoryReference: "Statutory reference",
    indicativeDuration: "Indicative duration",
    netConstructionValue: "Net construction value",
    additionalObligations: "additional",
    timelineNote1: "This procedure runs ",
    timelineNote2:
      " construction can start — its duration adds to, not overlaps with, the build schedule (see",
    disclaimer:
      "Indicative, educational simulation — not legal advice. Thresholds as of " +
      "July 2026 (Vergabebeschleunigungsgesetz, EU works threshold 2026/2027). " +
      "Net construction value approximated from the gross budget above (÷1.19 VAT, " +
      "8% planning share removed); real net-value assessment follows VgV/VOB/A " +
      "contract-splitting rules.",
  },
  de: {
    heading: "Vergabe-Simulation",
    intro1:
      "Wäre dieses Gebäude öffentlich beauftragt, würde sein Budget bestimmen, " +
      "welches Vergabeverfahren das deutsche Vergaberecht vorschreibt. " +
      "Konfiguriertes Gebäude:",
    introChangeLink: "in der Simulation ändern",
    state: "Bundesland",
    above: "darüber",
    upTo: "≤",
    statutoryReference: "Rechtsgrundlage",
    indicativeDuration: "Indikative Dauer",
    netConstructionValue: "Netto-Bauwert",
    additionalObligations: "zusätzliche",
    timelineNote1: "Dieses Verfahren läuft ",
    timelineNote2:
      " der Bau beginnen kann — seine Dauer kommt zum Bauzeitplan hinzu, statt sich mit ihm zu überschneiden (siehe",
    disclaimer:
      "Indikative, edukative Simulation — keine Rechtsberatung. Schwellenwerte " +
      "Stand Juli 2026 (Vergabebeschleunigungsgesetz, EU-Bauschwellenwert " +
      "2026/2027). Der Netto-Bauwert wird aus dem obigen Bruttobudget angenähert " +
      "(÷1,19 USt., 8% Planungsanteil abgezogen); die reale Netto-Wert-Bewertung " +
      "folgt den VgV/VOB/A-Losaufteilungsregeln.",
  },
};

/** The gross budget that best targets this band, clamped to the typology's
 * own realistic range. Always clickable — for typologies whose budget range
 * never reaches a given band (e.g. a Vehicle Shelter can't reach "EU-weit"),
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
export default function ProcurementSection({ locale }: { locale: Locale }) {
  const budget = useSimStore((s) => s.budget);
  const bundesland = useSimStore((s) => s.bundesland);
  const houseType = useSimStore((s) => s.houseType);
  const setBundesland = useSimStore((s) => s.setBundesland);
  const setBudget = useSimStore((s) => s.setBudget);
  const t = STRINGS[locale];

  const result = deriveVergabe(budget, bundesland);
  const activeIndex = VERGABE_BANDS.findIndex((b) => b.id === result.band.id);

  return (
    <section id="procurement" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headRow}>
          <div>
            <h2 className={styles.heading}>{t.heading}</h2>
            <p className={styles.intro}>
              {t.intro1}{" "}
              <strong>
                {HOUSE_TYPE_LABELS[locale][houseType].label}, {euro(budget)}
              </strong>{" "}
              — <Link href={withLocale(locale, "/")}>{t.introChangeLink}</Link>.
            </p>
          </div>

          <div className={styles.landToggle}>
            <span className={styles.landLabel}>{t.state}</span>
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
                title={`${locale === "de" ? "Budget setzen auf" : "Set budget to"} ${euro(jumpTo)}`}
                onClick={() => setBudget(jumpTo)}
                className={`${styles.pill} ${i === activeIndex ? styles.pillActive : ""} ${i < activeIndex ? styles.pillPassed : ""}`}
              >
                <span className={styles.pillName}>{b.nameDe}</span>
                {locale === "en" && <span className={styles.pillGloss}>{b.nameEn}</span>}
                <span className={styles.pillCap}>
                  {b.upToNet === Infinity ? t.above : `${t.upTo} ${euro(b.upToNet)}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* active band detail */}
        <div className={styles.detailCard}>
          <div className={styles.detailHead}>
            <span className={styles.detailTerm}>{result.band.nameDe}</span>
            {locale === "en" && <span className={styles.detailGloss}>— {result.band.nameEn}</span>}
          </div>
          <p className={styles.detailExplanation}>{result.band.explanation[locale]}</p>
          <div className={styles.detailMeta}>
            <div>
              <span>{t.statutoryReference}</span>
              <strong>{result.band.reference[locale]}</strong>
            </div>
            <div>
              <span>{t.indicativeDuration}</span>
              <strong>{result.band.durationRange[locale]}</strong>
            </div>
            <div>
              <span>{t.netConstructionValue}</span>
              <strong>{euro(result.budgetNet)}</strong>
            </div>
          </div>

          <div className={styles.obligations}>
            <span className={styles.obligationsTitle}>
              {result.landObligation.actName} — {t.additionalObligations}{" "}
              {LAND_LABELS.find((l) => l.key === bundesland)?.label}{" "}
              {locale === "de" ? "Pflichten" : "obligations"}
            </span>
            <ul>
              {result.landObligation.points[locale].map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className={styles.timelineNote}>
          {t.timelineNote1}
          <strong>{locale === "de" ? "vor" : "before"}</strong>
          {t.timelineNote2}{" "}
          <Link href={withLocale(locale, "/about")}>{locale === "de" ? "Über" : "About"}</Link>).
        </p>

        <p className={styles.disclaimer}>{t.disclaimer}</p>

        <MSCallout locale={locale} />
      </div>
    </section>
  );
}
