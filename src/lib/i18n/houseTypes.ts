import { HouseType } from "@/lib/shell/types";
import { Locale } from "./locale";

export interface HouseTypeLabel {
  label: string;
  desc: string;
  /** who commissions this typology, in the simulation's framing */
  client: string;
}

/** Single source of truth for typology display strings — shared by
 *  BuildHUD, ConfigPanel, Datasheet and ProcurementSection (previously
 *  duplicated across all four). */
export const HOUSE_TYPE_LABELS: Record<Locale, Record<HouseType, HouseTypeLabel>> = {
  en: {
    shelter: {
      label: "Vehicle Shelter",
      desc: "Geodesic carport, on stilts",
      client: "District parks department (Bauhof)",
    },
    office: {
      label: "Tourism Office",
      desc: "Glazed street front",
      client: "Municipality / tourism board",
    },
    library: {
      label: "Library",
      desc: "Two-level branch library",
      client: "Municipality (branch library)",
    },
  },
  de: {
    shelter: {
      label: "Fahrzeugunterstand",
      desc: "Geodätischer Carport auf Stelzen",
      client: "Grünflächenamt (Bauhof)",
    },
    office: {
      label: "Touristeninformation",
      desc: "Verglaste Straßenfront",
      client: "Kommune / Tourismusverband",
    },
    library: {
      label: "Bibliothek",
      desc: "Zweigeschossige Zweigstellenbibliothek",
      client: "Kommune (Stadtteilbibliothek)",
    },
  },
};

export const HOUSE_TYPE_ORDER: HouseType[] = ["shelter", "office", "library"];

/** house types as an ordered array (for .map over the type picker) */
export function houseTypesList(
  locale: Locale
): (HouseTypeLabel & { key: HouseType })[] {
  return HOUSE_TYPE_ORDER.map((key) => ({ key, ...HOUSE_TYPE_LABELS[locale][key] }));
}
