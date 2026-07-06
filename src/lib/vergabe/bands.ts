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
    reference: "VOB/A §3a Abs. 1 (as amended 01.01.2026)",
    durationRange: "~1 day – 1 week",
    explanation:
      "Below €50,000 net, the contracting authority may award the contract directly to a single company, no competitive process required.",
  },
  {
    id: "freihaendig",
    nameDe: "Freihändige Vergabe",
    nameEn: "negotiated procedure without competition",
    upToNet: 100_000,
    reference: "VOB/A §3a Abs. 1 (as amended 01.01.2026)",
    durationRange: "~1–3 weeks",
    explanation:
      "Below €100,000 net, the authority may negotiate with one or a few chosen bidders instead of running an open tender.",
  },
  {
    id: "beschraenkt",
    nameDe: "Beschränkte Ausschreibung ohne Teilnahmewettbewerb",
    nameEn: "restricted procedure without prior call for competition",
    upToNet: 150_000,
    reference: "VOB/A §3a Abs. 1 (as amended 01.01.2026)",
    durationRange: "~3–6 weeks",
    explanation:
      "Below €150,000 net, the authority invites a limited number of known suitable companies to submit offers, without a public call for competition.",
  },
  {
    id: "oeffentlich",
    nameDe: "Öffentliche Ausschreibung",
    nameEn: "public (open national) tender",
    upToNet: 5_404_000,
    reference: "VOB/A Abschnitt 1 (§3a) — national default procedure",
    durationRange: "~6–10 weeks",
    explanation:
      "Above €150,000 net and below the EU threshold, an open public tender is the default national procedure — anyone may submit an offer.",
  },
  {
    id: "euweit",
    nameDe: "EU-weites offenes Verfahren",
    nameEn: "EU-wide open procedure",
    upToNet: Infinity,
    reference: "§106 GWB i. V. m. VOB/A-EU (Abschnitt 2) — EU works threshold €5,404,000 net (2026/27)",
    durationRange: "~12–20 weeks",
    explanation:
      "Above the EU works threshold, the contract must be tendered EU-wide under GWB/VgV rules, with minimum publication and standstill periods.",
  },
];

/** find the band a given net budget falls into */
export function bandForNetBudget(budgetNet: number): VergabeBand {
  return (
    VERGABE_BANDS.find((b) => budgetNet <= b.upToNet) ??
    VERGABE_BANDS[VERGABE_BANDS.length - 1]
  );
}
