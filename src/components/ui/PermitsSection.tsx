"use client";

import Link from "next/link";
import { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import styles from "./PermitsSection.module.css";

type CountryCard = {
  key: string;
  name: string;
  band: string[];
  rows: { term: string; text: string }[];
};

const COUNTRIES: Record<Locale, CountryCard[]> = {
  en: [
    {
      key: "de",
      name: "Germany",
      band: ["#151515", "#dd0000", "#ffce00"],
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
      band: ["#ed2939", "#ffffff", "#ed2939"],
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
      band: ["#da291c", "#da291c", "#da291c"],
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
  ],
  de: [
    {
      key: "de",
      name: "Deutschland",
      band: ["#151515", "#dd0000", "#ffce00"],
      rows: [
        {
          term: "Rechtsgrundlage",
          text: "Landesbauordnung des jeweiligen Bundeslandes; die bundesweite Musterbauordnung dient als Vorlage.",
        },
        {
          term: "Kuppel-spezifisch",
          text: "Abstandsflächen für gekrümmte Dächer werden meist über eine fiktive Traufhöhe ermittelt — ein eigener Abstimmungstermin mit der Bauaufsicht ist zu erwarten. Öffentliche Gebäude wie eine Bibliothek gelten meist als Sonderbau, was zusätzliche Brandschutz- und Standsicherheitsprüfungen mit sich bringt.",
        },
        {
          term: "Verfahren",
          text: "Vereinfachtes Genehmigungsverfahren für kleine Bauten; volles Verfahren sobald als Sonderbau eingestuft.",
        },
        { term: "Typische Dauer", text: "~3–6 Monate (vereinfacht) · 6–10 Monate (volles Verfahren)" },
        { term: "Gebühren", text: "~0,5–1,0% der Baukosten (landesrechtliche Gebührenordnungen)" },
      ],
    },
    {
      key: "at",
      name: "Österreich",
      band: ["#ed2939", "#ffffff", "#ed2939"],
      rows: [
        {
          term: "Rechtsgrundlage",
          text: "Bauordnung des jeweiligen Bundeslandes — Wien, Nieder- und Oberösterreich regeln jeweils eigenständig.",
        },
        {
          term: "Kuppel-spezifisch",
          text: "Runde Grundrisse gelten oft als Bauwerk besonderer Art — zusätzliche Statik- und bauphysikalische Nachweise werden häufig verlangt.",
        },
        {
          term: "Verfahren",
          text: "Baubewilligungsverfahren mit Nachbarbeteiligung; bei kleinen Nebengebäuden genügt eine einfache Anzeige.",
        },
        { term: "Typische Dauer", text: "~4–8 Monate, abhängig von Nachbareinwendungen" },
        { term: "Gebühren", text: "~0,5–1,2% der Baukosten, zuzüglich Gutachten" },
      ],
    },
    {
      key: "ch",
      name: "Schweiz",
      band: ["#da291c", "#da291c", "#da291c"],
      rows: [
        {
          term: "Rechtsgrundlage",
          text: "Kantonales Baugesetz plus kommunale Bauvorschriften — stark föderal, die Regeln unterscheiden sich von Gemeinde zu Gemeinde.",
        },
        {
          term: "Kuppel-spezifisch",
          text: "Kommunale Gestaltungs- und Ortsbildschutzvorschriften sind oft der limitierende Faktor, nicht die Statik; die öffentliche Auflage des Gesuchs ist Standard.",
        },
        {
          term: "Verfahren",
          text: "Ordentliches Baubewilligungsverfahren mit öffentlicher Auflage und 20–30 Tagen Einsprachefrist.",
        },
        { term: "Typische Dauer", text: "~3–7 Monate, zuzüglich Einsprachefrist" },
        { term: "Gebühren", text: "~0,5–1,5% der Bausumme — variiert stark nach Kanton und Gemeinde" },
      ],
    },
  ],
};

const STRINGS: Record<Locale, { heading: string; intro: string }> = {
  en: {
    heading: "Building Permits",
    intro:
      "Procurement decides who may build — the building permit decides whether " +
      "and what. Domes are permittable, but they are not the standard case: the " +
      "curved geodesic form falls outside typified roof shapes, which mainly " +
      "affects setback calculations, fire-safety proofs and — depending on use " +
      "— classification as a special-use building. The three DACH countries " +
      "handle this differently.",
  },
  de: {
    heading: "Baugenehmigung",
    intro:
      "Die Vergabe entscheidet, wer bauen darf — die Baugenehmigung entscheidet, " +
      "ob und was. Kuppeln sind genehmigungsfähig, aber sie sind nicht der " +
      "Standardfall: Die gekrümmte geodätische Form fällt aus den typisierten " +
      "Dachformen heraus, was vor allem Abstandsflächenberechnungen, " +
      "Brandschutznachweise und — je nach Nutzung — die Einstufung als " +
      "Sonderbau betrifft. Die drei DACH-Länder gehen damit unterschiedlich um.",
  },
};

/**
 * Static content section: how the DACH countries treat a building permit for
 * a dome-shaped public building. Content adapted from the Meile + Stein
 * design draft; complements the procurement simulation (award law) above
 * with the second approval track (building law).
 */
export default function PermitsSection({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <section id="permits" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>{t.heading}</h2>
        <p className={styles.intro}>
          <Link href={withLocale(locale, "/procurement")}>
            {locale === "de" ? "Vergabe" : "Procurement"}
          </Link>{" "}
          {t.intro}
        </p>

        <div className={styles.grid}>
          {COUNTRIES[locale].map((c) => (
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
          {locale === "de" ? (
            <>
              Typisierte Planungshinweise, keine Rechtsberatung — das tatsächliche
              Verfahren, Fristen und Gebühren hängen vom konkreten Bundesland,
              Kanton oder der Gemeinde und der Gebäudeklasse ab. Die
              Zeitplan-Tabelle auf der{" "}
              <Link href={withLocale(locale, "/about")}>About-Seite</Link> setzt
              3–12 Monate für die Genehmigungsphase an, um diese gesamte
              Bandbreite abzudecken.
            </>
          ) : (
            <>
              Typified planning guidance, not legal advice — the actual procedure,
              deadlines and fees depend on the specific Bundesland, canton or
              municipality and the building class. The schedule table on the{" "}
              <Link href={withLocale(locale, "/about")}>About page</Link> uses
              3–12 months for the permit phase to cover this full spread.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
