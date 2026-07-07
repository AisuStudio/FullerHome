"use client";

import { useRef, useState } from "react";
import CostStructure from "./CostStructure";
import MSCallout from "./MSCallout";
import { Locale } from "@/lib/i18n/locale";
import styles from "./DeliverySection.module.css";

const TAKTS: Record<
  Locale,
  { idx: string; title: string; text: string; tag: string }[]
> = {
  en: [
    {
      idx: "Takt 01",
      title: "Site & needs analysis",
      text: "Plot, utilities access, setback areas, zoning check, first rough costs.",
      tag: "Pull trigger: plot data",
    },
    {
      idx: "Takt 02",
      title: "Permit & procurement planning",
      text: "Permit application, structural verification, early alignment with the building authority — for public clients, the award procedure (see Procurement) runs here.",
      tag: "Critical path",
    },
    {
      idx: "Takt 03",
      title: "Material & robot mobilization",
      text: "Plate blanks ordered, robot and depot logistics scheduled while permits are pending. On-site milling means there is no factory prefab to wait for.",
      tag: "Parallelized",
    },
    {
      idx: "Takt 04",
      title: "On-site takt assembly",
      text: "The robot mills and places plate by plate to a weekly last-planner schedule, with a quality gate per takt.",
      tag: "PPC measured",
    },
    {
      idx: "Takt 05",
      title: "Acceptance & handover",
      text: "Final inspection (Abnahme), completion notice, documentation handover to the operator.",
      tag: "Milestone",
    },
  ],
  de: [
    {
      idx: "Takt 01",
      title: "Standort- & Bedarfsanalyse",
      text: "Grundstück, Erschließungszugang, Abstandsflächen, Bebauungsplan-Prüfung, erste Grobkosten.",
      tag: "Pull-Auslöser: Grundstücksdaten",
    },
    {
      idx: "Takt 02",
      title: "Genehmigungs- & Vergabeplanung",
      text: "Bauantrag, Standsicherheitsnachweis, frühe Abstimmung mit der Bauaufsicht — bei öffentlichen Auftraggebern läuft hier das Vergabeverfahren (siehe Vergabe).",
      tag: "Kritischer Pfad",
    },
    {
      idx: "Takt 03",
      title: "Material- & Robotermobilisierung",
      text: "Plattenrohlinge bestellt, Roboter- und Depotlogistik geplant, während Genehmigungen noch ausstehen. Fräsen vor Ort heißt: keine Fabrikvorfertigung, auf die gewartet werden muss.",
      tag: "Parallelisiert",
    },
    {
      idx: "Takt 04",
      title: "Takt-Montage vor Ort",
      text: "Der Roboter fräst und platziert Platte für Platte nach wöchentlichem Last-Planner-Zeitplan, mit einem Qualitätstor pro Takt.",
      tag: "PPC gemessen",
    },
    {
      idx: "Takt 05",
      title: "Abnahme & Übergabe",
      text: "Schlussabnahme, Fertigstellungsanzeige, Dokumentationsübergabe an den Betreiber.",
      tag: "Meilenstein",
    },
  ],
};

const PRINCIPLES: Record<
  Locale,
  { tag: string; title: string; text: string }[]
> = {
  en: [
    {
      tag: "Pull principle",
      title: "Scheduled backwards from handover",
      text: "The sequence is planned from the desired opening date backwards — permits and procurement start early enough that they never become the bottleneck.",
    },
    {
      tag: "Last Planner System",
      title: "Weekly release with a PPC metric",
      text: "Each takt is released week by week; the Percent-Plan-Complete figure makes slippage visible immediately instead of at the end date.",
    },
    {
      tag: "Buffer management",
      title: "Visible buffers, not hidden padding",
      text: "Buffers for permits, weather and supply chains are named blocks of their own — not silently priced into individual tasks.",
    },
    {
      tag: "Takt planning",
      title: "A steady rhythm on site",
      text: "Assembly follows fixed takt times per shell ring, so robot, crew and logistics run at an even, predictable utilization.",
    },
  ],
  de: [
    {
      tag: "Pull-Prinzip",
      title: "Rückwärts von der Übergabe geplant",
      text: "Die Reihenfolge wird vom gewünschten Eröffnungstermin aus rückwärts geplant — Genehmigungen und Vergabe starten früh genug, dass sie nie zum Engpass werden.",
    },
    {
      tag: "Last-Planner-System",
      title: "Wöchentliche Freigabe mit PPC-Kennzahl",
      text: "Jeder Takt wird Woche für Woche freigegeben; die Percent-Plan-Complete-Kennzahl macht Verzögerungen sofort sichtbar statt erst am Endtermin.",
    },
    {
      tag: "Puffermanagement",
      title: "Sichtbare Puffer statt versteckter Reserven",
      text: "Puffer für Genehmigungen, Wetter und Lieferketten sind eigene, benannte Blöcke — nicht still in einzelne Aufgaben eingepreist.",
    },
    {
      tag: "Taktplanung",
      title: "Ein gleichmäßiger Rhythmus auf der Baustelle",
      text: "Die Montage folgt festen Taktzeiten pro Schalenring, sodass Roboter, Team und Logistik gleichmäßig und planbar ausgelastet sind.",
    },
  ],
};

const DEVIATIONS: Record<Locale, { title: string; text: string }[]> = {
  en: [
    {
      title: "Risk buffers instead of after-the-fact math",
      text: "Permit and change-order buffers are priced in from day one — they are not “discovered” when a problem hits.",
    },
    {
      title: "Early warning via PPC and milestone status",
      text: "Delays in permitting or fabrication show up in the weekly numbers, not at the planned completion date.",
    },
    {
      title: "Structured change orders",
      text: "Extra costs from authority conditions or design changes become documented change orders (Nachträge) with cause, cost and schedule impact.",
    },
    {
      title: "Milestone-based payments",
      text: "Payments attach to verified milestones — permit granted, shell complete — so client and builder share an interest in realistic dates.",
    },
    {
      title: "Early authority involvement",
      text: "Pre-application meetings with the building authority are the single biggest lever against permit-stage delays for unusual shapes like a dome.",
    },
  ],
  de: [
    {
      title: "Risikopuffer statt nachträglicher Rechnung",
      text: "Puffer für Genehmigungen und Nachträge sind von Anfang an eingepreist — sie werden nicht erst „entdeckt“, wenn ein Problem auftritt.",
    },
    {
      title: "Frühwarnung über PPC und Meilenstein-Status",
      text: "Verzögerungen bei Genehmigung oder Fertigung zeigen sich in den Wochenzahlen, nicht erst am geplanten Fertigstellungstermin.",
    },
    {
      title: "Strukturierte Nachträge",
      text: "Mehrkosten durch Behördenauflagen oder Planänderungen werden zu dokumentierten Nachträgen mit Ursache, Kosten- und Terminwirkung.",
    },
    {
      title: "Meilenstein-basierte Zahlungen",
      text: "Zahlungen sind an geprüfte Meilensteine geknüpft — Genehmigung erteilt, Schale fertig — sodass Auftraggeber und Bauunternehmen ein gemeinsames Interesse an realistischen Terminen haben.",
    },
    {
      title: "Frühe Einbindung der Behörde",
      text: "Vorgespräche mit der Bauaufsicht sind der wirksamste Hebel gegen Verzögerungen in der Genehmigungsphase bei ungewöhnlichen Formen wie einer Kuppel.",
    },
  ],
};

const STRINGS: Record<
  Locale,
  {
    heading: string;
    projectTakts: string;
    devHead: string;
    devIntro: string;
  }
> = {
  en: {
    heading: "Lean Project Delivery",
    projectTakts: "Project takts",
    devHead: "When budget or schedule slips anyway",
    devIntro:
      "Overruns can rarely be avoided entirely — least of all in procedures that " +
      "depend on authorities. What can be designed is a process that surfaces " +
      "deviations early instead of excusing them late:",
  },
  de: {
    heading: "Lean Project Delivery",
    projectTakts: "Projekttakte",
    devHead: "Wenn Budget oder Termin trotzdem abweichen",
    devIntro:
      "Überschreitungen lassen sich selten ganz vermeiden — am wenigsten bei " +
      "Verfahren, die von Behörden abhängen. Gestalten lässt sich aber ein " +
      "Prozess, der Abweichungen früh sichtbar macht, statt sie spät zu " +
      "entschuldigen:",
  },
};

/**
 * How a real FullerHome project would be run: Lean takts, principles and
 * deviation handling. Content adapted from the Meile + Stein design draft,
 * reframed from marketing copy to concept-study tone.
 */
export default function DeliverySection({ locale }: { locale: Locale }) {
  const [activeTakt, setActiveTakt] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = STRINGS[locale];
  const takts = TAKTS[locale];

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % takts.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + takts.length) % takts.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = takts.length - 1;
    else return;
    e.preventDefault();
    setActiveTakt(next);
    tabRefs.current[next]?.focus();
  };

  const takt = takts[activeTakt];

  return (
    <section id="delivery" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>{t.heading}</h2>
        <p className={styles.intro}>
          {locale === "de" ? (
            <>
              Wäre FullerHome ein echter Bauträgerbetrieb, würde das Projekt nicht
              als fünf klassische Planungsphasen laufen, sondern als{" "}
              <strong>fünf Takte</strong> — kurze, klar abgegrenzte Stufen mit
              definierten Übergabekriterien, im Sinne von Lean Construction.
              Genehmigungen, Kosten und Termine sind von Anfang an Teil der
              Projektstruktur, kein später angehängtes Risiko.
            </>
          ) : (
            <>
              If FullerHome were a real delivery operation, the project would not
              run as five classical planning phases but as <strong>five takts</strong>{" "}
              — short, clearly bounded stages with defined handover criteria, in
              the spirit of Lean Construction. Permits, costs and dates are part
              of the project structure from the start, not a risk appended later.
            </>
          )}
        </p>

        <div className={styles.taktTabs} role="tablist" aria-label={t.projectTakts}>
          {takts.map((tk, i) => (
            <button
              key={tk.idx}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`takt-tab-${i}`}
              aria-selected={i === activeTakt}
              aria-controls="takt-panel"
              tabIndex={i === activeTakt ? 0 : -1}
              className={`${styles.taktTab} ${i === activeTakt ? styles.taktTabActive : ""}`}
              onClick={() => setActiveTakt(i)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
            >
              {tk.idx}
            </button>
          ))}
        </div>
        <div
          id="takt-panel"
          role="tabpanel"
          aria-labelledby={`takt-tab-${activeTakt}`}
          className={styles.taktPanel}
        >
          <h3>{takt.title}</h3>
          <p>{takt.text}</p>
          <span className={styles.taktTag}>{takt.tag}</span>
        </div>

        <CostStructure locale={locale} />

        <div className={styles.principleGrid}>
          {PRINCIPLES[locale].map((p) => (
            <div key={p.tag} className={styles.principle}>
              <span className={styles.principleTag}>{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>

        <h3 className={styles.devHead}>{t.devHead}</h3>
        <p className={styles.devIntro}>{t.devIntro}</p>
        <ol className={styles.devList}>
          {DEVIATIONS[locale].map((d) => (
            <li key={d.title}>
              <strong>{d.title}.</strong> {d.text}
            </li>
          ))}
        </ol>

        <MSCallout locale={locale} />
      </div>
    </section>
  );
}
