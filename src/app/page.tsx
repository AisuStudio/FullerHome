"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Bare "/" isn't a real page — every route lives under /en or /de. Static
 *  export can't do a server redirect, so: detect browser language client-
 *  side and replace immediately, with a <meta refresh> fallback (hoisted to
 *  <head> automatically) plus visible links for no-JS / very first paint. */
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const preferred = navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
    router.replace(`/${preferred}`);
  }, [router]);

  return (
    <>
      <meta httpEquiv="refresh" content="1; url=en/" />
      <p style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        Redirecting… <a href="en/">Continue in English</a> ·{" "}
        <a href="de/">Weiter auf Deutsch</a>
      </p>
    </>
  );
}
