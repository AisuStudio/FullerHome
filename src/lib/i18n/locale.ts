export type Locale = "en" | "de";

export const LOCALES: Locale[] = ["en", "de"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

/** Next's generated route types always widen a dynamic segment's params to
 *  `string` (it can't know our custom union), so every page/layout under
 *  [locale] receives `{ locale: string }` and narrows it here. */
export function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}
