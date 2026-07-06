"use client";

import { useEffect } from "react";
import { useSimStore } from "@/lib/store";

/** Rehydrates the persisted configuration (type, budget, state) from
 * localStorage after mount — so the static prerender always matches the
 * first client render, and the configuration survives page navigation. */
export default function StoreHydrator() {
  useEffect(() => {
    useSimStore.persist.rehydrate();
  }, []);
  return null;
}
