import type { Metadata } from "next";
import PermitsSection from "@/components/ui/PermitsSection";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Permits — FullerHome",
  description:
    "How Germany, Austria and Switzerland treat a building permit for a dome-shaped public building.",
};

export default function PermitsPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <PermitsSection />
      </div>
    </main>
  );
}
