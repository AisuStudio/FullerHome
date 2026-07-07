import { Locale } from "@/lib/i18n/locale";

export type Bundesland = "berlin" | "brandenburg";

export interface VergabeBand {
  /** internal id, also used as a stable key in the UI */
  id: "direktauftrag" | "freihaendig" | "beschraenkt" | "oeffentlich" | "euweit";
  /** German procurement-law term of art — shown as-is, not translated */
  nameDe: string;
  /** short English gloss, not a translation of the term itself — shown
   *  only in the English UI, alongside nameDe */
  nameEn: string;
  /** upper bound, net EUR; Infinity for the top band */
  upToNet: number;
  /** statutory reference, verified against Norman/Material sources, per UI locale */
  reference: Record<Locale, string>;
  /** indicative procedure duration, as a range string, per UI locale */
  durationRange: Record<Locale, string>;
  /** one-sentence explanation, per UI locale */
  explanation: Record<Locale, string>;
}

export interface LandObligation {
  /** German act name, shown as a proper noun */
  actName: string;
  /** short bullet points (German term named), per UI locale */
  points: Record<Locale, string[]>;
}

export interface VergabeResult {
  band: VergabeBand;
  /** net value used for the lookup (derived from the gross budget) */
  budgetNet: number;
  landObligation: LandObligation;
}
