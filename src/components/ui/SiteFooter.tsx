import { Locale } from "@/lib/i18n/locale";
import styles from "./SiteFooter.module.css";

const STRINGS: Record<Locale, { lead: string; caveat: string; meta: string }> = {
  en: {
    lead: "This is an experiment in progress: ",
    caveat: "a WebGL simulation, not an engineering or legal tool. It (still) makes no claim to accuracy.",
    meta: "FullerHome — WebGL spike",
  },
  de: {
    lead: "Das ist ein Experiment in Arbeit: ",
    caveat: "eine WebGL-Simulation, kein Ingenieurs- oder Rechtstool. Es erhebt (noch) keinen Anspruch auf Genauigkeit.",
    meta: "FullerHome — WebGL-Spike",
  },
};

/** Shared footer across all pages, carrying the experiment caveat. */
export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.caveat}>
          <strong>{t.lead}</strong>
          {t.caveat}
        </p>
        <div className={styles.meta}>
          <span>{t.meta}</span>
          <span>Next.js · three.js · React Three Fiber · Zustand</span>
        </div>
      </div>
    </footer>
  );
}
