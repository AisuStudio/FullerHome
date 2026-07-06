"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteNav.module.css";

const LINKS = [
  { num: "01", label: "Simulation", href: "/" },
  { num: "02", label: "Procurement", href: "/procurement" },
  { num: "03", label: "Permits", href: "/permits" },
  { num: "04", label: "Delivery", href: "/delivery" },
  { num: "05", label: "About", href: "/about" },
];

const normalize = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);

/** Sticky site navigation across the five pages (pattern borrowed from the
 * M+S design draft, re-skinned to the Aisu palette). */
export default function SiteNav() {
  const pathname = normalize(usePathname() ?? "/");

  return (
    <nav className={styles.nav} aria-label="Site">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          FullerHome
        </Link>
        <ul className={styles.links}>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`${styles.link} ${active ? styles.active : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={styles.num}>{l.num}</span>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
