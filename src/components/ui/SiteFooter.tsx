import { Locale } from "@/lib/i18n/locale";
import styles from "./SiteFooter.module.css";

const STRINGS: Record<Locale, { lead: string; caveat: string; meta: string; collab: string }> = {
  en: {
    lead: "This is an experiment in progress: ",
    caveat: "a WebGL simulation, not an engineering or legal tool. It (still) makes no claim to accuracy.",
    meta: "FullerHome — WebGL spike",
    collab: "This project is a collaboration of Aisu.Studio and Meile + Stein.",
  },
  de: {
    lead: "Das ist ein Experiment in Arbeit: ",
    caveat: "eine WebGL-Simulation, kein Ingenieurs- oder Rechtstool. Es erhebt (noch) keinen Anspruch auf Genauigkeit.",
    meta: "FullerHome — WebGL-Spike",
    collab: "Dieses Projekt ist eine Zusammenarbeit von Aisu.Studio und Meile + Stein.",
  },
};

/** Shared footer across all pages, carrying the experiment caveat. */
export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  // split on the two proper nouns so they can become links without a
  // second, locale-duplicated copy of the surrounding sentence
  const [beforeAisu, rest] = t.collab.split("Aisu.Studio");
  const [betweenNames, afterStein] = rest.split("Meile + Stein");

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.caveat}>
          <strong>{t.lead}</strong>
          {t.caveat}
        </p>
        <p className={styles.collab}>
          {beforeAisu}
          <a href="https://aisu.studio" target="_blank" rel="noopener noreferrer">
            Aisu.Studio
          </a>
          {betweenNames}
          <a href="https://meilestn.de/" target="_blank" rel="noopener noreferrer">
            Meile + Stein
          </a>
          {afterStein}
        </p>
        <div className={styles.meta}>
          <span>{t.meta}</span>
          <span>Next.js · three.js · React Three Fiber · Zustand</span>
        </div>
      </div>
    </footer>
  );
}
