"use client";

import styles from "./SiteNav.module.css";

const LINKS = [
  { num: "01", label: "Simulation", href: "#sim" },
  { num: "02", label: "Procurement", href: "#procurement" },
  { num: "03", label: "Permits", href: "#permits" },
  { num: "04", label: "Delivery", href: "#delivery" },
  { num: "05", label: "About", href: "#info" },
];

/** Sticky anchor navigation (pattern borrowed from the M+S design draft,
 * re-skinned to the Aisu palette). */
export default function SiteNav() {
  return (
    <nav className={styles.nav} aria-label="Page sections">
      <div className={styles.inner}>
        <a href="#top" className={styles.brand}>
          FullerHome
        </a>
        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={styles.link}>
                <span className={styles.num}>{l.num}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
