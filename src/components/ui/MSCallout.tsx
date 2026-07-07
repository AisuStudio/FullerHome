import { Locale } from "@/lib/i18n/locale";
import styles from "./MSCallout.module.css";

const STRINGS: Record<Locale, { text: string; cta: string }> = {
  en: {
    text:
      "This simulation covers three simple public-building typologies — real " +
      "projects are rarely that clean. For more complex buildings (schools, " +
      "hospitals, mixed-use), Meile + Stein can deliver the real procurement " +
      "and Lean-schedule calculation.",
    cta: "Want to audit a project? Ask us →",
  },
  de: {
    text:
      "Diese Simulation deckt drei einfache öffentliche Gebäudetypologien ab — " +
      "reale Projekte sind selten so übersichtlich. Für komplexere Gebäude " +
      "(Schulen, Krankenhäuser, Mischnutzung) liefert Meile + Stein die echte " +
      "Vergabe- und Lean-Bauablauf-Berechnung.",
    cta: "Projekt-Audit gewünscht? Fragt uns →",
  },
};

/** Lead-gen callout for the two purely calculation-driven sections
 * (Procurement, Delivery) — the underlying math isn't tied to the 3D
 * geometry, so Meile + Stein can run it for typologies this simulation
 * can't model. Shared so the pitch stays consistent across both pages.
 * Links straight to M+S's own lead funnel (project audit), not just their
 * homepage, so the CTA ends on a page that asks the visitor to act. */
export default function MSCallout({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <div className={styles.callout}>
      <p>{t.text}</p>
      <a
        href="https://meilestn.de/projektaudit/"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ctaLink}
      >
        {t.cta}
      </a>
    </div>
  );
}
