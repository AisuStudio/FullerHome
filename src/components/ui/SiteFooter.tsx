import Link from "next/link";
import { Locale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import styles from "./SiteFooter.module.css";

const STRINGS: Record<
  Locale,
  { ctaLead: string; ctaSim: string; ctaDelivery: string; lead: string; caveat: string; meta: string }
> = {
  en: {
    ctaLead: "Want to try it yourself?",
    ctaSim: "Configure a building →",
    ctaDelivery: "Run the Lean schedule →",
    lead: "This is an experiment in progress: ",
    caveat: "a WebGL simulation, not an engineering or legal tool. It (still) makes no claim to accuracy.",
    meta: "FullerHome — WebGL spike",
  },
  de: {
    ctaLead: "Selbst ausprobieren?",
    ctaSim: "Ein Gebäude konfigurieren →",
    ctaDelivery: "Den Lean-Bauablauf durchspielen →",
    lead: "Das ist ein Experiment in Arbeit: ",
    caveat: "eine WebGL-Simulation, kein Ingenieurs- oder Rechtstool. Es erhebt (noch) keinen Anspruch auf Genauigkeit.",
    meta: "FullerHome — WebGL-Spike",
  },
};

/** Shared footer across all pages, carrying the experiment caveat + a CTA
 * back into the two interactive tools (building config, Lean schedule). */
export default function SiteFooter({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.cta}>
          <span className={styles.ctaLead}>{t.ctaLead}</span>
          <Link href={withLocale(locale, "/")} className={styles.ctaLink}>
            {t.ctaSim}
          </Link>
          <Link href={withLocale(locale, "/delivery")} className={styles.ctaLink}>
            {t.ctaDelivery}
          </Link>
        </div>

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
