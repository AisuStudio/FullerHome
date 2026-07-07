"use client";

import { useSimStore } from "@/lib/store";
import { buildingDims } from "@/lib/shell/generate";
import { Locale } from "@/lib/i18n/locale";
import { HOUSE_TYPE_LABELS } from "@/lib/i18n/houseTypes";
import styles from "./Datasheet.module.css";

const euro = (n: number) => "€" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const STRINGS: Record<
  Locale,
  {
    liveTag: string;
    building: string;
    type: string;
    footprintHeight: string;
    floorArea: string;
    levels: string;
    shellSurface: string;
    material: string;
    timberPlates: string;
    glassPlates: string;
    glassFacade: string;
    mullions: string;
    shellWeight: string;
    joints: string;
    cnc: string;
    timeline: string;
    robotAssembly: string;
    shellRealistic: string;
    foundationUtilities: string;
    interiorFitOut: string;
    turnkey: string;
    costs: string;
    timberShellSlab: string;
    glazing: string;
    foundation: string;
    utilitiesServices: string;
    robotDeployment: string;
    planningPermits: string;
    total: string;
    note: string;
    hApprox: string;
    approxWeeks: string;
  }
> = {
  en: {
    liveTag: "live from the configuration above",
    building: "Building",
    type: "Type",
    footprintHeight: "Footprint / height",
    floorArea: "Floor area",
    levels: "(2 levels)",
    shellSurface: "Shell surface",
    material: "Material",
    timberPlates: "Timber plates (beech CLT, 50 mm)",
    glassPlates: "Glass plates (insulated)",
    glassFacade: "Glass facade",
    mullions: "m², timber mullions",
    shellWeight: "Shell weight",
    joints: "Joints",
    cnc: "CNC-milled on site",
    timeline: "Timeline",
    robotAssembly: "Robot assembly (simulation)",
    shellRealistic: "Shell, realistic",
    foundationUtilities: "Foundation + utilities",
    interiorFitOut: "Interior fit-out",
    turnkey: "Turnkey from groundbreaking",
    costs: "Costs",
    timberShellSlab: "Timber shell incl. slab",
    glazing: "Glazing",
    foundation: "Foundation",
    utilitiesServices: "Utilities / services core",
    robotDeployment: "Robot deployment",
    planningPermits: "Planning & permits (8%)",
    total: "Total",
    note:
      "Rough estimates illustrating the parametric model — not quotes. Footprint is " +
      "fixed per typology; a higher budget buys a higher spec tier (shell, foundation, " +
      "systems, fit-out), not more floor area — a park shelter and a branch library " +
      "sit at very different construction-quality bands, not different sizes. cf. BKI " +
      "construction cost data. Excludes insulation layer / energy-code compliance and " +
      "the permitting phase (see Procurement section below for that timeline).",
    hApprox: "h ≈",
    approxWeeks: "weeks",
  },
  de: {
    liveTag: "live aus der Konfiguration oben",
    building: "Gebäude",
    type: "Typ",
    footprintHeight: "Grundriss / Höhe",
    floorArea: "Nutzfläche",
    levels: "(2 Ebenen)",
    shellSurface: "Schalenfläche",
    material: "Material",
    timberPlates: "Holzplatten (Buchen-Brettsperrholz, 50 mm)",
    glassPlates: "Glasplatten (isoliert)",
    glassFacade: "Glasfassade",
    mullions: "m², Holzsprossen",
    shellWeight: "Schalengewicht",
    joints: "Verbindungen",
    cnc: "vor Ort CNC-gefräst",
    timeline: "Zeitplan",
    robotAssembly: "Robotermontage (Simulation)",
    shellRealistic: "Schale, realistisch",
    foundationUtilities: "Fundament + Erschließung",
    interiorFitOut: "Innenausbau",
    turnkey: "Schlüsselfertig ab Baubeginn",
    costs: "Kosten",
    timberShellSlab: "Holzschale inkl. Bodenplatte",
    glazing: "Verglasung",
    foundation: "Fundament",
    utilitiesServices: "Erschließung / Versorgungskern",
    robotDeployment: "Robotereinsatz",
    planningPermits: "Planung & Genehmigungen (8%)",
    total: "Gesamt",
    note:
      "Grobe Schätzungen zur Veranschaulichung des parametrischen Modells — keine " +
      "Angebote. Der Grundriss ist je Typologie fest; ein höheres Budget kauft ein " +
      "höheres Ausstattungsniveau (Schale, Fundament, Systeme, Innenausbau), nicht mehr " +
      "Fläche — ein Park-Unterstand und eine Zweigstellenbibliothek liegen in sehr " +
      "unterschiedlichen Bauqualitätsklassen, nicht unterschiedlichen Größen. Vgl. " +
      "BKI-Baukostendaten. Ohne Dämmschicht / energetische Normkonformität und die " +
      "Genehmigungsphase (siehe Vergabe-Abschnitt unten für diesen Zeitplan).",
    hApprox: "h ≈",
    approxWeeks: "Wochen",
  },
};

/** Live datasheet — always reflects the current configuration in the sim above */
export default function Datasheet({ locale }: { locale: Locale }) {
  const design = useSimStore((s) => s.design);
  const costs = useSimStore((s) => s.costs);
  const houseType = useSimStore((s) => s.houseType);

  const label = HOUSE_TYPE_LABELS[locale][houseType];
  const dims = buildingDims(design);
  const t = STRINGS[locale];

  return (
    <div className={styles.sheet}>
      <div className={styles.sheetHeader}>
        <span className={styles.sheetTag}>{t.liveTag}</span>
        <h3 className={styles.sheetTitle}>FullerHome &ldquo;{label.label}&rdquo;</h3>
      </div>

      <div className={styles.columns}>
        <section>
          <h4>{t.building}</h4>
          <dl className={styles.specList}>
            <div><dt>{t.type}</dt><dd>{label.label} — {label.desc}</dd></div>
            <div><dt>{t.footprintHeight}</dt><dd>{dims.widthM} × {dims.lengthM} m / {dims.heightM} m</dd></div>
            <div><dt>{t.floorArea}</dt><dd>{costs.floorAreaM2} m² {design.floorSlabY !== undefined ? t.levels : ""}</dd></div>
            <div><dt>{t.shellSurface}</dt><dd>{costs.shellAreaM2} m²</dd></div>
          </dl>

          <h4>{t.material}</h4>
          <dl className={styles.specList}>
            <div><dt>{t.timberPlates}</dt><dd>{design.bom.woodPlates} {locale === "de" ? "Stk." : "pcs"}</dd></div>
            <div><dt>{t.glassPlates}</dt><dd>{design.bom.glassPlates} {locale === "de" ? "Stk." : "pcs"}</dd></div>
            {design.glassFront && (
              <div><dt>{t.glassFacade}</dt><dd>{Math.round((Math.PI / 2) * design.glassFront.rc ** 2)} {t.mullions}</dd></div>
            )}
            <div><dt>{t.shellWeight}</dt><dd>{(design.bom.totalWeightKg / 1000).toFixed(1)} t</dd></div>
            <div><dt>{t.joints}</dt><dd>{t.cnc}</dd></div>
          </dl>
        </section>

        <section>
          <h4>{t.timeline}</h4>
          <dl className={styles.specList}>
            <div><dt>{t.robotAssembly}</dt><dd>{costs.buildHours} {t.hApprox} {costs.shellDays} {locale === "de" ? (costs.shellDays > 1 ? "Tage" : "Tag") : `day${costs.shellDays > 1 ? "s" : ""}`}</dd></div>
            <div><dt>{t.shellRealistic}</dt><dd>{locale === "de" ? "1–2 Wochen" : "1–2 weeks"}</dd></div>
            <div><dt>{t.foundationUtilities}</dt><dd>{locale === "de" ? "3–4 Wochen" : "3–4 weeks"}</dd></div>
            <div><dt>{t.interiorFitOut}</dt><dd>~{costs.fitoutWeeks} {t.approxWeeks}</dd></div>
            <div className={styles.specTotal}><dt>{t.turnkey}</dt><dd>{locale === "de" ? "4–6 Monate" : "4–6 months"}</dd></div>
          </dl>

          <h4>{t.costs}</h4>
          <dl className={styles.specList}>
            <div><dt>{t.timberShellSlab}</dt><dd>{euro(costs.wood)}</dd></div>
            <div><dt>{t.glazing}</dt><dd>{euro(costs.glass)}</dd></div>
            <div><dt>{t.foundation}</dt><dd>{euro(costs.foundation)}</dd></div>
            <div><dt>{t.interiorFitOut}</dt><dd>{euro(costs.fitout)}</dd></div>
            <div><dt>{t.utilitiesServices}</dt><dd>{euro(costs.utilities)}</dd></div>
            <div><dt>{t.robotDeployment}</dt><dd>{euro(costs.robot)}</dd></div>
            <div><dt>{t.planningPermits}</dt><dd>{euro(costs.planning)}</dd></div>
            <div className={styles.specTotal}><dt>{t.total}</dt><dd>{euro(costs.total)}</dd></div>
          </dl>
        </section>
      </div>

      <p className={styles.sheetNote}>{t.note}</p>
    </div>
  );
}
