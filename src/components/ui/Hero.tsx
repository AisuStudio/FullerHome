import heroImg from "@/assets/hero.jpg";
import logoBeige from "@/assets/fh-logo-beige.svg";
import { Locale } from "@/lib/i18n/locale";
import styles from "./Hero.module.css";

const STRINGS: Record<Locale, { h1: string; pitch: string }> = {
  en: {
    h1: "FullerHome — On-Site Robotic Shell Construction Concept / WebGL Experiment",
    pitch:
      "A WebGL experiment inspired by the timber pavilion of the 2014 " +
      "Landesgartenschau in Schwäbisch Gmünd — itself a publicly commissioned " +
      "building: configure a public plate-shell building, then watch an " +
      "on-site robot mill and assemble it — plate by plate, bottom up.",
  },
  de: {
    h1: "FullerHome — Konzept für robotischen Vor-Ort-Schalenbau / WebGL-Experiment",
    pitch:
      "Ein WebGL-Experiment, inspiriert vom Holzpavillon der Landesgartenschau " +
      "2014 in Schwäbisch Gmünd — selbst ein öffentlich beauftragtes Gebäude: " +
      "konfiguriere ein öffentliches Plattenschalen-Gebäude und beobachte, wie " +
      "ein Vor-Ort-Roboter es fräst und montiert — Platte für Platte, von " +
      "unten nach oben.",
  },
};

/** Full-bleed hero banner below the site header — the render itself is the
 * pitch: a library exactly like the one the simulation builds. */
export default function Hero({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${heroImg.src})` }}
    >
      <div className={styles.scrim} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.srOnly}>{t.h1}</h1>
          <img src={logoBeige.src} alt="FullerHome" className={styles.logo} />
          <p className={styles.text}>{t.pitch}</p>
        </div>
      </div>
    </section>
  );
}
