import SiteFooter from "@/components/ui/SiteFooter";
import SiteNav from "@/components/ui/SiteNav";
import StoreHydrator from "@/components/ui/StoreHydrator";
import { LOCALES, resolveLocale } from "@/lib/i18n/locale";
import SetHtmlLang from "./SetHtmlLang";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveLocale((await params).locale);
  return (
    <>
      <SetHtmlLang locale={locale} />
      <StoreHydrator />
      <SiteNav locale={locale} />
      {children}
      <SiteFooter locale={locale} />
    </>
  );
}
