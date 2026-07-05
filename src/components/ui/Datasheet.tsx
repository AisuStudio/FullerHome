"use client";

import { useSimStore } from "@/lib/store";
import styles from "./Datasheet.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const TYPE_LABELS: Record<string, { label: string; desc: string }> = {
  iglu: { label: "Igloo", desc: "Classic dome" },
  panorama: { label: "Panorama", desc: "Straight glass front" },
  loft: { label: "Loft", desc: "Two levels" },
};

/** Live datasheet — always reflects the current configuration in the sim above */
export default function Datasheet() {
  const design = useSimStore((s) => s.design);
  const costs = useSimStore((s) => s.costs);
  const houseType = useSimStore((s) => s.houseType);

  const t = TYPE_LABELS[houseType];

  return (
    <div className={styles.sheet}>
      <div className={styles.sheetHeader}>
        <span className={styles.sheetTag}>live from the configuration above</span>
        <h3 className={styles.sheetTitle}>FullerHome &ldquo;{t.label}&rdquo;</h3>
      </div>

      <div className={styles.columns}>
        <section>
          <h4>Building</h4>
          <dl className={styles.specList}>
            <div><dt>Type</dt><dd>{t.label} — {t.desc}</dd></div>
            <div><dt>Radius / height</dt><dd>{design.config.radius.toFixed(1)} m / ~{(design.config.radius * (houseType === "loft" ? 1.3 : 1.0)).toFixed(1)} m</dd></div>
            <div><dt>Floor area</dt><dd>{costs.floorAreaM2} m² {design.floorSlabY !== undefined ? "(2 levels)" : ""}</dd></div>
            <div><dt>Shell surface</dt><dd>{costs.shellAreaM2} m²</dd></div>
          </dl>

          <h4>Material</h4>
          <dl className={styles.specList}>
            <div><dt>Timber plates (beech CLT, 50 mm)</dt><dd>{design.bom.woodPlates} pcs</dd></div>
            <div><dt>Glass plates (insulated)</dt><dd>{design.bom.glassPlates} pcs</dd></div>
            {design.glassFront && (
              <div><dt>Glass facade</dt><dd>{Math.round((Math.PI / 2) * design.glassFront.rc ** 2)} m², timber mullions</dd></div>
            )}
            <div><dt>Shell weight</dt><dd>{(design.bom.totalWeightKg / 1000).toFixed(1)} t</dd></div>
            <div><dt>Joints</dt><dd>CNC-milled on site</dd></div>
          </dl>
        </section>

        <section>
          <h4>Timeline</h4>
          <dl className={styles.specList}>
            <div><dt>Robot assembly (simulation)</dt><dd>{costs.buildHours} h ≈ {costs.shellDays} day{costs.shellDays > 1 ? "s" : ""}</dd></div>
            <div><dt>Shell, realistic</dt><dd>1–2 weeks</dd></div>
            <div><dt>Foundation + utilities</dt><dd>3–4 weeks</dd></div>
            <div><dt>Interior fit-out</dt><dd>~{costs.fitoutWeeks} weeks</dd></div>
            <div className={styles.specTotal}><dt>Turnkey from groundbreaking</dt><dd>4–6 months</dd></div>
          </dl>

          <h4>Costs</h4>
          <dl className={styles.specList}>
            <div><dt>Timber shell incl. slab</dt><dd>{euro(costs.wood)}</dd></div>
            <div><dt>Glazing</dt><dd>{euro(costs.glass)}</dd></div>
            <div><dt>Foundation</dt><dd>{euro(costs.foundation)}</dd></div>
            <div><dt>Interior fit-out</dt><dd>{euro(costs.fitout)}</dd></div>
            <div><dt>Utilities / services core</dt><dd>{euro(costs.utilities)}</dd></div>
            <div><dt>Robot deployment</dt><dd>{euro(costs.robot)}</dd></div>
            <div><dt>Planning &amp; permits (8%)</dt><dd>{euro(costs.planning)}</dd></div>
            <div className={styles.specTotal}><dt>Total</dt><dd>{euro(costs.total)}</dd></div>
          </dl>
        </section>
      </div>

      <p className={styles.sheetNote}>
        Rough estimates illustrating the parametric model — not quotes. Typical 2026
        ranges (Germany): fabricated CLT shell €350–550/m², insulated glazing
        €500–900/m², slab foundation €150–250/m², interior fit-out €1,100–1,800/m²,
        utilities connection €18–35k, planning &amp; permits 6–12%. Comparable turnkey
        small houses land at €2,800–4,500 per m² of floor area. Excludes insulation
        layer / energy-code compliance and the permitting phase.
      </p>
    </div>
  );
}
