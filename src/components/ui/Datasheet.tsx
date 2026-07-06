"use client";

import { useSimStore } from "@/lib/store";
import { buildingDims } from "@/lib/shell/generate";
import styles from "./Datasheet.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const TYPE_LABELS: Record<string, { label: string; desc: string }> = {
  shelter: { label: "Vehicle Shelter", desc: "Geodesic carport, on stilts" },
  office: { label: "Tourism Office", desc: "Glazed street front" },
  library: { label: "Library", desc: "Two-level branch library" },
};

/** Live datasheet — always reflects the current configuration in the sim above */
export default function Datasheet() {
  const design = useSimStore((s) => s.design);
  const costs = useSimStore((s) => s.costs);
  const houseType = useSimStore((s) => s.houseType);

  const t = TYPE_LABELS[houseType];
  const dims = buildingDims(design);

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
            <div><dt>Footprint / height</dt><dd>{dims.widthM} × {dims.lengthM} m / {dims.heightM} m</dd></div>
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
        Rough estimates illustrating the parametric model — not quotes. Footprint is
        fixed per typology; a higher budget buys a higher spec tier (shell, foundation,
        systems, fit-out), not more floor area — a park shelter and a branch library
        sit at very different construction-quality bands, not different sizes. cf. BKI
        construction cost data. Excludes insulation layer / energy-code compliance and
        the permitting phase (see Procurement section below for that timeline).
      </p>
    </div>
  );
}
