import heroImg from "@/assets/hero.jpg";
import logoBeige from "@/assets/fh-logo-beige.svg";
import styles from "./Hero.module.css";

/** Full-bleed hero banner below the site header — the render itself is the
 * pitch: a library exactly like the one the simulation builds. */
export default function Hero() {
  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${heroImg.src})` }}
    >
      <div className={styles.scrim} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <h1 className={styles.srOnly}>
            FullerHome — On-Site Robotic Shell Construction Concept / WebGL Experiment
          </h1>
          <img src={logoBeige.src} alt="FullerHome" className={styles.logo} />
          <p className={styles.text}>
            A WebGL experiment inspired by the timber pavilion of the 2014
            Landesgartenschau in Schwäbisch Gmünd — itself a publicly commissioned
            building: configure a public plate-shell building, then watch an
            on-site robot mill and assemble it — plate by plate, bottom up.
          </p>
        </div>
      </div>
    </section>
  );
}
