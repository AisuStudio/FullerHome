import { Locale, LOCALES } from "./locale";

/** prefix an app-internal path with the locale segment, for <Link href> */
export function withLocale(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** swap the leading /en or /de segment of the current pathname for the
 *  other locale, keeping the rest of the path — used by the nav's DE/EN
 *  toggle so switching languages stays on the same page. */
export function switchLocaleHref(pathname: string, otherLocale: Locale): string {
  const rest = pathname.replace(/^\/(en|de)/, "");
  return `/${otherLocale}${rest}`;
}

/** which locale the current pathname belongs to, defaulting to "en" if
 *  the leading segment isn't a recognized locale (shouldn't happen once
 *  routing is in place, but keeps callers safe). */
export function localeFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/(en|de)(\/|$)/);
  const candidate = match?.[1];
  return (LOCALES as string[]).includes(candidate ?? "") ? (candidate as Locale) : "en";
}
