import type { Metadata } from "next";
import ProcurementSection from "@/components/ui/ProcurementSection";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Procurement — FullerHome",
  description:
    "Which German award procedure (Vergabeverfahren) the configured building would trigger — live simulation for Berlin and Brandenburg.",
};

export default function ProcurementPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <ProcurementSection />
      </div>
    </main>
  );
}
