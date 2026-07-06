import { Bundesland, LandObligation } from "./types";

// ---------------------------------------------------------------------------
// State-level (Land) obligations that apply on top of VOB/A for public
// construction contracts. Kept short by design (2–4 bullets) — these are
// simplified pointers, not a full compliance checklist.
// Sources: Norman/Material/Berlin/INDEX.md (BerlAVG + Rundschreiben),
// Norman/Material/Brandenburg/INDEX.md (BbgVergG + Durchführungsverordnung).
// ---------------------------------------------------------------------------

export const LAND_OBLIGATIONS: Record<Bundesland, LandObligation> = {
  berlin: {
    actName: "BerlAVG (Berliner Ausschreibungs- und Vergabegesetz)",
    points: [
      "Vergabemindestentgelt — bidders must declare payment of the Berlin minimum procurement wage",
      "Tariftreue — declaration of compliance with the relevant collective wage agreement",
      "Frauenförderung — women's-advancement declaration (Frauenförderverordnung) above certain contract values",
      "VwVBU environmental criteria — mandatory environmental requirements in the specification, per the Verwaltungsvorschrift Beschaffung und Umwelt",
    ],
  },
  brandenburg: {
    actName: "BbgVergG (Brandenburgisches Vergabegesetz)",
    points: [
      "Mindestentgelt — bidders must declare payment of the Brandenburg minimum wage for the contract",
      "Tariftreue — declaration of compliance with the applicable collective wage agreement",
      "Nachweispflichten — evidence/verification duties under the BbgVergG-Durchführungsverordnung (audits, contract-debarment register)",
    ],
  },
};
