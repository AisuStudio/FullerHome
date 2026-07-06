"use client";

import styles from "./PermitsSection.module.css";

type CountryCard = {
  key: string;
  name: string;
  band: string[];
  rows: { term: string; text: string }[];
};

const COUNTRIES: CountryCard[] = [
  {
    key: "de",
    name: "Germany",
    band: ["#1f1934", "#d8ff01", "#eae8e0"],
    rows: [
      {
        term: "Legal basis",
        text: "State building code (Landesbauordnung) of the respective Bundesland; the national Musterbauordnung serves as the template.",
      },
      {
        term: "Dome-specific",
        text: "Setback areas (Abstandsflächen) for curved roofs are usually derived from a substitute eave height — expect a dedicated round with the building authority. Public buildings like a library are typically classed as Sonderbau, adding external fire-safety and structural review.",
      },
      {
        term: "Procedure",
        text: "Simplified permit procedure for small structures; full procedure once classed as Sonderbau.",
      },
      { term: "Typical duration", text: "~3–6 months (simplified) · 6–10 months (full procedure)" },
      { term: "Fees", text: "~0.5–1.0% of construction cost (state fee schedules)" },
    ],
  },
  {
    key: "at",
    name: "Austria",
    band: ["#b8322c", "#f4f2ec", "#b8322c"],
    rows: [
      {
        term: "Legal basis",
        text: "Building code of the respective Bundesland — Vienna, Lower and Upper Austria each regulate independently.",
      },
      {
        term: "Dome-specific",
        text: "Round floor plans often count as a Bauwerk besonderer Art (structure of special type) — additional structural and building-physics reports are commonly required.",
      },
      {
        term: "Procedure",
        text: "Building-approval procedure (Baubewilligung) with neighbor participation; simple notification only for small auxiliary structures.",
      },
      { term: "Typical duration", text: "~4–8 months, depending on neighbor objections" },
      { term: "Fees", text: "~0.5–1.2% of construction cost, plus reports" },
    ],
  },
  {
    key: "ch",
    name: "Switzerland",
    band: ["#b8322c", "#b8322c", "#b8322c"],
    rows: [
      {
        term: "Legal basis",
        text: "Cantonal building act plus the municipal building regulations — strongly federal, rules differ town by town.",
      },
      {
        term: "Dome-specific",
        text: "Municipal design and townscape rules (Ortsbildschutz) are often the limiting factor rather than structure; public posting of the application is standard.",
      },
      {
        term: "Procedure",
        text: "Ordinary building-permit procedure with public posting and a 20–30 day objection window.",
      },
      { term: "Typical duration", text: "~3–7 months, plus the objection period" },
      { term: "Fees", text: "~0.5–1.5% of construction sum — varies widely by canton and municipality" },
    ],
  },
];

/**
 * Static content section: how the DACH countries treat a building permit for
 * a dome-shaped public building. Content adapted from the Meile + Stein
 * design draft; complements the procurement simulation (award law) above
 * with the second approval track (building law).
 */
export default function PermitsSection() {
  return (
    <section id="permits" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Building Permits</h2>
        <p className={styles.intro}>
          Procurement (above) decides <em>who</em> may build — the building permit
          decides <em>whether</em> and <em>what</em>. Domes are permittable, but they
          are not the standard case: the curved geodesic form falls outside typified
          roof shapes, which mainly affects setback calculations, fire-safety proofs
          and — depending on use — classification as a special-use building. The
          three DACH countries handle this differently.
        </p>

        <div className={styles.grid}>
          {COUNTRIES.map((c) => (
            <div key={c.key} className={styles.card}>
              <div
                className={styles.flagband}
                aria-hidden="true"
                style={{
                  background: `linear-gradient(90deg, ${c.band[0]} 33%, ${c.band[1]} 33% 66%, ${c.band[2]} 66%)`,
                }}
              />
              <h3>{c.name}</h3>
              <dl>
                {c.rows.map((r) => (
                  <div key={r.term}>
                    <dt>{r.term}</dt>
                    <dd>{r.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className={styles.caveat}>
          Typified planning guidance, not legal advice — the actual procedure, deadlines
          and fees depend on the specific Bundesland, canton or municipality and the
          building class. The schedule table further down uses 3–12 months for the
          permit phase to cover this full spread.
        </p>
      </div>
    </section>
  );
}
