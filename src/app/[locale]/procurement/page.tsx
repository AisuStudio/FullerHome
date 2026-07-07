import type { Metadata } from "next";
import ProcurementSection from "@/components/ui/ProcurementSection";
import { Locale, resolveLocale } from "@/lib/i18n/locale";
import styles from "../../page.module.css";

const META: Record<Locale, Metadata> = {
  en: {
    title: "Procurement — FullerHome",
    description:
      "Which German award procedure (Vergabeverfahren) the configured building would trigger — live simulation for Berlin and Brandenburg.",
  },
  de: {
    title: "Vergabe — FullerHome",
    description:
      "Welches deutsche Vergabeverfahren das konfigurierte Gebäude auslösen würde — Live-Simulation für Berlin und Brandenburg.",
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

export default async function ProcurementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <ProcurementSection locale={locale} />
      </div>
    </main>
  );
}
