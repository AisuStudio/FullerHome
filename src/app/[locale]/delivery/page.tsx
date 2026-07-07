import type { Metadata } from "next";
import DeliverySection from "@/components/ui/DeliverySection";
import { Locale, resolveLocale } from "@/lib/i18n/locale";
import styles from "../../page.module.css";

const META: Record<Locale, Metadata> = {
  en: {
    title: "Delivery — FullerHome",
    description:
      "How a real FullerHome project would be run: five lean takts, visible buffers, DIN 276 cost structure and deviation handling.",
  },
  de: {
    title: "Bauablauf — FullerHome",
    description:
      "Wie ein reales FullerHome-Projekt ablaufen würde: fünf Lean-Takte, sichtbare Puffer, DIN-276-Kostenstruktur und Abweichungsmanagement.",
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

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <DeliverySection locale={locale} />
      </div>
    </main>
  );
}
