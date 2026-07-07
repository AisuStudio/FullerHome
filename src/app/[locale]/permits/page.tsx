import type { Metadata } from "next";
import PermitsSection from "@/components/ui/PermitsSection";
import { Locale, resolveLocale } from "@/lib/i18n/locale";
import styles from "../../page.module.css";

const META: Record<Locale, Metadata> = {
  en: {
    title: "Permits — FullerHome",
    description:
      "How Germany, Austria and Switzerland treat a building permit for a dome-shaped public building.",
  },
  de: {
    title: "Baugenehmigung — FullerHome",
    description:
      "Wie Deutschland, Österreich und die Schweiz eine Baugenehmigung für ein kuppelförmiges öffentliches Gebäude behandeln.",
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

export default async function PermitsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <PermitsSection locale={locale} />
      </div>
    </main>
  );
}
