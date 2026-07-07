"use client";

import { useSimStore } from "@/lib/store";
import { Locale } from "@/lib/i18n/locale";
import { HOUSE_TYPE_LABELS } from "@/lib/i18n/houseTypes";
import ConfigPanel from "./ConfigPanel";
import styles from "./BuildHUD.module.css";

const PHASE_LABELS: Record<Locale, { key: string; label: string }[]> = {
  en: [
    { key: "planning", label: "Planning" },
    { key: "delivery", label: "Delivery" },
    { key: "building", label: "Construction" },
    { key: "done", label: "Complete" },
  ],
  de: [
    { key: "planning", label: "Planung" },
    { key: "delivery", label: "Anlieferung" },
    { key: "building", label: "Bau" },
    { key: "done", label: "Fertig" },
  ],
};

const STRINGS: Record<
  Locale,
  {
    houseType: string;
    plates: string;
    woodGlass: string;
    weight: string;
    rings: string;
    realBuildTime: string;
    deliverMaterial: string;
    startConstruction: string;
    pause: string;
    resume: string;
    buildAgain: string;
  }
> = {
  en: {
    houseType: "House type",
    plates: "Plates",
    woodGlass: "Wood / glass",
    weight: "Weight",
    rings: "Rings",
    realBuildTime: "Real build time",
    deliverMaterial: "Deliver material",
    startConstruction: "▶ Start construction",
    pause: "❚❚ Pause",
    resume: "▶ Resume",
    buildAgain: "↺ Build again",
  },
  de: {
    houseType: "Gebäudetyp",
    plates: "Platten",
    woodGlass: "Holz / Glas",
    weight: "Gewicht",
    rings: "Ringe",
    realBuildTime: "Reale Bauzeit",
    deliverMaterial: "Material anliefern",
    startConstruction: "▶ Bau starten",
    pause: "❚❚ Pause",
    resume: "▶ Fortsetzen",
    buildAgain: "↺ Erneut bauen",
  },
};

/** Left control column: timeline, config (planning) or stats (build), controls */
export default function BuildHUD({ locale }: { locale: Locale }) {
  const phase = useSimStore((s) => s.phase);
  const cursor = useSimStore((s) => s.cursor);
  const steps = useSimStore((s) => s.steps);
  const design = useSimStore((s) => s.design);
  const speed = useSimStore((s) => s.speed);
  const paused = useSimStore((s) => s.paused);
  const houseType = useSimStore((s) => s.houseType);
  const { startDelivery, startBuild, setSpeed, togglePause, reset, setCursor } =
    useSimStore();

  const phaseLabels = PHASE_LABELS[locale];
  const t = STRINGS[locale];
  const phaseIndex = phaseLabels.findIndex((p) => p.key === phase);
  const progress = steps.length > 0 ? cursor / steps.length : 0;
  const currentStep = phase === "building" && cursor < steps.length ? steps[cursor] : null;

  return (
    <div className={styles.panel}>
      {/* phase timeline */}
      <nav className={styles.timeline}>
        {phaseLabels.map((p, i) => (
          <div
            key={p.key}
            className={`${styles.timelineStep} ${i === phaseIndex ? styles.active : ""} ${i < phaseIndex ? styles.completed : ""}`}
          >
            <span className={styles.timelineDot} />
            {p.label}
          </div>
        ))}
      </nav>

      {/* planning: configuration */}
      {phase === "planning" && <ConfigPanel locale={locale} />}

      {/* delivery/build/done: stats */}
      {phase !== "planning" && (
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span>{t.houseType}</span>
            <strong>{HOUSE_TYPE_LABELS[locale][houseType].label}</strong>
          </div>
          <div className={styles.statRow}>
            <span>{t.plates}</span>
            <strong>{cursor} / {steps.length}</strong>
          </div>
          <div className={styles.statRow}>
            <span>{t.woodGlass}</span>
            <strong>{design.bom.woodPlates} / {design.bom.glassPlates}</strong>
          </div>
          <div className={styles.statRow}>
            <span>{t.weight}</span>
            <strong>{(design.bom.totalWeightKg / 1000).toFixed(1)} t</strong>
          </div>
          <div className={styles.statRow}>
            <span>{t.rings}</span>
            <strong>{currentStep ? currentStep.ring + 1 : phase === "done" ? design.rings : 0} / {design.rings}</strong>
          </div>
          {(phase === "building" || phase === "done") && (
            <div className={styles.statRow}>
              <span>{t.realBuildTime}</span>
              <strong>
                {(cursor * 0.3).toFixed(1)} h · day {Math.max(1, Math.ceil((cursor * 0.3) / 20))}
              </strong>
            </div>
          )}
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      {/* controls */}
      <div className={styles.controls}>
        {phase === "planning" && (
          <button className={styles.primaryBtn} onClick={startDelivery}>
            {t.deliverMaterial}
          </button>
        )}
        {phase === "delivery" && (
          <button className={styles.primaryBtn} onClick={startBuild}>
            {t.startConstruction}
          </button>
        )}
        {phase === "building" && (
          <>
            <button className={styles.secondaryBtn} onClick={togglePause}>
              {paused ? t.resume : t.pause}
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
            {t.buildAgain}
          </button>
        )}
      </div>
    </div>
  );
}
