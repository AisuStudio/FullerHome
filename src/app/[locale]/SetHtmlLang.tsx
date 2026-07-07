"use client";

import { useEffect } from "react";
import { Locale } from "@/lib/i18n/locale";

/** The root <html> lives in the true root layout (outside this dynamic
 *  [locale] segment), so its lang attribute can't be set from JSX here —
 *  set it directly once the locale is known. Not SEO-critical for this
 *  demo site; a static export has no server-side way to vary the root
 *  layout's own <html> per nested segment. */
export default function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
