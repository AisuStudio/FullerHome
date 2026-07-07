"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, LOCALES } from "@/lib/i18n/locale";
import { withLocale, switchLocaleHref } from "@/lib/i18n/paths";
import styles from "./SiteNav.module.css";

const LINKS: Record<Locale, { label: string; href: string }[]> = {
  en: [
    { label: "Simulation", href: "/" },
    { label: "Procurement", href: "/procurement" },
    { label: "Permits", href: "/permits" },
    { label: "Delivery", href: "/delivery" },
    { label: "About", href: "/about" },
  ],
  de: [
    { label: "Simulation", href: "/" },
    { label: "Vergabe", href: "/procurement" },
    { label: "Genehmigungen", href: "/permits" },
    { label: "Bauablauf", href: "/delivery" },
    { label: "Über", href: "/about" },
  ],
};

const normalize = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);

/** Sticky site navigation across the five pages (pattern borrowed from the
 * M+S design draft, re-skinned to the Aisu palette). */
export default function SiteNav({ locale }: { locale: Locale }) {
  const pathname = normalize(usePathname() ?? "/");
  const otherLocale = LOCALES.find((l) => l !== locale)!;

  return (
    <nav className={styles.nav} aria-label="Site">
      <div className={styles.inner}>
        <Link href={withLocale(locale, "/")} className={styles.brand}>
          FullerHome
        </Link>
        <div className={styles.navRight}>
          <ul className={styles.links}>
            {LINKS[locale].map((l) => {
              const href = withLocale(locale, l.href);
              const active = pathname === href;
              return (
                <li key={l.href}>
                  <Link
                    href={href}
                    className={`${styles.link} ${active ? styles.active : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={switchLocaleHref(pathname, otherLocale)}
            className={styles.langToggle}
            aria-label={locale === "en" ? "Auf Deutsch anzeigen" : "Show in English"}
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
