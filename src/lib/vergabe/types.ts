export type Bundesland = "berlin" | "brandenburg";

export interface VergabeBand {
  /** internal id, also used as a stable key in the UI */
  id: "direktauftrag" | "freihaendig" | "beschraenkt" | "oeffentlich" | "euweit";
  /** German procurement-law term of art — shown as-is, not translated */
  nameDe: string;
  /** short English gloss, not a translation of the term itself */
  nameEn: string;
  /** upper bound, net EUR; Infinity for the top band */
  upToNet: number;
  /** statutory reference, verified against Norman/Material sources */
  reference: string;
  /** indicative procedure duration, as a range string */
  durationRange: string;
  /** one-sentence explanation, English */
  explanation: string;
}

export interface LandObligation {
  /** German act name, shown as a proper noun */
  actName: string;
  /** short bullet points, English with the German term named */
  points: string[];
}

export interface VergabeResult {
  band: VergabeBand;
  /** net value used for the lookup (derived from the gross budget) */
  budgetNet: number;
  landObligation: LandObligation;
}
