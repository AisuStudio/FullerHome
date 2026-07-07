import type { Metadata } from "next";
import { Locale, resolveLocale } from "@/lib/i18n/locale";
import AboutContentEn from "./AboutContentEn";
import AboutContentDe from "./AboutContentDe";
import styles from "../../page.module.css";

const META: Record<Locale, Metadata> = {
  en: {
    title: "About — FullerHome",
    description:
      "The idea behind FullerHome: the 2014 Landesgartenschau plate shell, Buckminster Fuller, the In-situ Fabricator, and how the simulation works.",
  },
  de: {
    title: "Über — FullerHome",
    description:
      "Die Idee hinter FullerHome: die Plattenschale der Landesgartenschau 2014, Buckminster Fuller, der In-situ Fabricator, und wie die Simulation funktioniert.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return META[locale];
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <section id="info" className={styles.infoSection}>
          <div className={styles.infoInner}>
            {locale === "de" ? (
              <AboutContentDe locale={locale} />
            ) : (
              <AboutContentEn locale={locale} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
