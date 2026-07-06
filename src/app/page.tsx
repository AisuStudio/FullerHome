"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import BuildHUD from "@/components/ui/BuildHUD";
import Hero from "@/components/ui/Hero";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import styles from "./page.module.css";

const Scene3D = dynamic(() => import("@/components/scene/Scene3D"), { ssr: false });

export default function HomePage() {
  return (
    <main className={styles.main}>
      <Hero />

      <div className={styles.pageWrap}>
        {/* --- Split: controls left, 3D right (configure + build) --- */}
        <div id="sim" className={styles.split}>
          <aside className={styles.leftCol}>
            <BuildHUD />
          </aside>

          <section className={styles.simSection}>
            <ErrorBoundary>
              <Scene3D />
            </ErrorBoundary>
          </section>
        </div>

        <p className={styles.nextHint}>
          Your configuration carries over:{" "}
          <Link href="/procurement">see which award procedure it would trigger →</Link>
        </p>
      </div>
    </main>
  );
}
