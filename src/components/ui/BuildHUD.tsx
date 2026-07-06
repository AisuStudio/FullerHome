"use client";

import { useSimStore } from "@/lib/store";
import { HouseType } from "@/lib/shell/types";
import ConfigPanel from "./ConfigPanel";
import styles from "./BuildHUD.module.css";

const PHASE_LABELS: { key: string; label: string }[] = [
  { key: "planning", label: "Planning" },
  { key: "delivery", label: "Delivery" },
  { key: "building", label: "Construction" },
  { key: "done", label: "Complete" },
];

export const HOUSE_TYPES: {
  key: HouseType;
  label: string;
  desc: string;
  /** who commissions this typology, in the simulation's framing */
  client: string;
}[] = [
  { key: "shelter", label: "Weather Shelter", desc: "Small park pavilion", client: "District parks department" },
  { key: "office", label: "Tourism Office", desc: "Glazed street front", client: "Municipality / tourism board" },
  { key: "library", label: "Library", desc: "Two-level branch library", client: "Municipality (branch library)" },
];

/** Left control column: timeline, config (planning) or stats (build), controls */
export default function BuildHUD() {
  const phase = useSimStore((s) => s.phase);
  const cursor = useSimStore((s) => s.cursor);
  const steps = useSimStore((s) => s.steps);
  const design = useSimStore((s) => s.design);
  const speed = useSimStore((s) => s.speed);
  const paused = useSimStore((s) => s.paused);
  const houseType = useSimStore((s) => s.houseType);
  const { startDelivery, startBuild, setSpeed, togglePause, reset, setCursor } =
    useSimStore();

  const phaseIndex = PHASE_LABELS.findIndex((p) => p.key === phase);
  const progress = steps.length > 0 ? cursor / steps.length : 0;
  const currentStep = phase === "building" && cursor < steps.length ? steps[cursor] : null;

  return (
    <div className={styles.panel}>
      {/* phase timeline */}
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

      {/* planning: configuration */}
      {phase === "planning" && <ConfigPanel />}

      {/* delivery/build/done: stats */}
      {phase !== "planning" && (
        <div className={styles.stats}>
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
    </div>
  );
}
