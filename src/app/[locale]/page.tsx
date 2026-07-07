"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BuildHUD from "@/components/ui/BuildHUD";
import Hero from "@/components/ui/Hero";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Locale, resolveLocale } from "@/lib/i18n/locale";
import { withLocale } from "@/lib/i18n/paths";
import styles from "../page.module.css";

const Scene3D = dynamic(() => import("@/components/scene/Scene3D"), { ssr: false });

const STRINGS: Record<Locale, { nextHint: string; nextLink: string }> = {
  en: {
    nextHint: "Your configuration carries over: ",
    nextLink: "see which award procedure it would trigger →",
  },
  de: {
    nextHint: "Deine Konfiguration wird übernommen: ",
    nextLink: "siehe, welches Vergabeverfahren sie auslösen würde →",
  },
};

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale(use(params).locale);
  const t = STRINGS[locale];

  return (
    <main className={styles.main}>
      <Hero locale={locale} />

      <div className={styles.pageWrap}>
        {/* --- Split: controls left, 3D right (configure + build) --- */}
        <div id="sim" className={styles.split}>
          <aside className={styles.leftCol}>
            <BuildHUD locale={locale} />
          </aside>

          <section className={styles.simSection}>
            <ErrorBoundary>
              <Scene3D />
            </ErrorBoundary>
          </section>
        </div>

        <p className={styles.nextHint}>
          {t.nextHint}
          <Link href={withLocale(locale, "/procurement")}>{t.nextLink}</Link>
        </p>
      </div>
    </main>
  );
}
