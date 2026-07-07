import { VergabeBand } from "./types";

// ---------------------------------------------------------------------------
// Procurement-procedure bands for German public construction contracts.
// Bund-wide value thresholds as of 01.07.2026 (Vergabebeschleunigungsgesetz,
// BGBl. 2026 I Nr. 137, in force since that date; VOB/A §3a thresholds raised
// 01.01.2026). EU threshold for works contracts: Delegated Regulation (EU)
// 2025/2152 of 22 Oct 2025, applicable 2026–2027 — €5,404,000 net (down from
// €5,538,000 for 2024/2025; verified via DStGB/vergabeblog/cosinex, Oct 2025).
// Sources: Norman/Material/Bund/{GWB,VgV,Vergabebeschleunigungsgesetz_...}.pdf
// and Norman/Material/Bund/INDEX.md. Duration ranges are illustrative
// procurement-practice estimates, not statutory deadlines.
// ---------------------------------------------------------------------------

export const VERGABE_BANDS: VergabeBand[] = [
  {
    id: "direktauftrag",
    nameDe: "Direktauftrag",
    nameEn: "direct award without competition",
    upToNet: 50_000,
    reference: {
      en: "VOB/A §3a Abs. 1 (as amended 01.01.2026)",
      de: "VOB/A §3a Abs. 1 (Fassung vom 01.01.2026)",
    },
    durationRange: {
      en: "~1 day – 1 week",
      de: "~1 Tag – 1 Woche",
    },
    explanation: {
      en: "Below €50,000 net, the contracting authority may award the contract directly to a single company, no competitive process required.",
      de: "Unter 50.000 € netto darf der Auftraggeber den Auftrag direkt an ein einzelnes Unternehmen vergeben — kein Wettbewerbsverfahren erforderlich.",
    },
  },
  {
    id: "freihaendig",
    nameDe: "Freihändige Vergabe",
    nameEn: "negotiated procedure without competition",
    upToNet: 100_000,
    reference: {
      en: "VOB/A §3a Abs. 1 (as amended 01.01.2026)",
      de: "VOB/A §3a Abs. 1 (Fassung vom 01.01.2026)",
    },
    durationRange: {
      en: "~1–3 weeks",
      de: "~1–3 Wochen",
    },
    explanation: {
      en: "Below €100,000 net, the authority may negotiate with one or a few chosen bidders instead of running an open tender.",
      de: "Unter 100.000 € netto darf der Auftraggeber mit einem oder wenigen ausgewählten Bietern verhandeln, statt eine offene Ausschreibung durchzuführen.",
    },
  },
  {
    id: "beschraenkt",
    nameDe: "Beschränkte Ausschreibung ohne Teilnahmewettbewerb",
    nameEn: "restricted procedure without prior call for competition",
    upToNet: 150_000,
    reference: {
      en: "VOB/A §3a Abs. 1 (as amended 01.01.2026)",
      de: "VOB/A §3a Abs. 1 (Fassung vom 01.01.2026)",
    },
    durationRange: {
      en: "~3–6 weeks",
      de: "~3–6 Wochen",
    },
    explanation: {
      en: "Below €150,000 net, the authority invites a limited number of known suitable companies to submit offers, without a public call for competition.",
      de: "Unter 150.000 € netto lädt der Auftraggeber eine begrenzte Zahl bekannter, geeigneter Unternehmen zur Angebotsabgabe ein, ohne öffentlichen Teilnahmewettbewerb.",
    },
  },
  {
    id: "oeffentlich",
    nameDe: "Öffentliche Ausschreibung",
    nameEn: "public (open national) tender",
    upToNet: 5_404_000,
    reference: {
      en: "VOB/A Abschnitt 1 (§3a) — national default procedure",
      de: "VOB/A Abschnitt 1 (§3a) — nationales Regelverfahren",
    },
    durationRange: {
      en: "~6–10 weeks",
      de: "~6–10 Wochen",
    },
    explanation: {
      en: "Above €150,000 net and below the EU threshold, an open public tender is the default national procedure — anyone may submit an offer.",
      de: "Über 150.000 € netto und unter dem EU-Schwellenwert ist die öffentliche Ausschreibung das nationale Regelverfahren — jeder darf ein Angebot abgeben.",
    },
  },
  {
    id: "euweit",
    nameDe: "EU-weites offenes Verfahren",
    nameEn: "EU-wide open procedure",
    upToNet: Infinity,
    reference: {
      en: "§106 GWB i. V. m. VOB/A-EU (Abschnitt 2) — EU works threshold €5,404,000 net (2026/27)",
      de: "§106 GWB i. V. m. VOB/A-EU (Abschnitt 2) — EU-Bauschwellenwert 5.404.000 € netto (2026/27)",
    },
    durationRange: {
      en: "~12–20 weeks",
      de: "~12–20 Wochen",
    },
    explanation: {
      en: "Above the EU works threshold, the contract must be tendered EU-wide under GWB/VgV rules, with minimum publication and standstill periods.",
      de: "Über dem EU-Bauschwellenwert muss der Auftrag EU-weit nach GWB/VgV ausgeschrieben werden, mit Mindestfristen für Veröffentlichung und Stillhaltefrist.",
    },
  },
];

/** find the band a given net budget falls into */
export function bandForNetBudget(budgetNet: number): VergabeBand {
  return (
    VERGABE_BANDS.find((b) => budgetNet <= b.upToNet) ??
    VERGABE_BANDS[VERGABE_BANDS.length - 1]
  );
}
