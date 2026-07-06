import type { Metadata } from "next";
import DeliverySection from "@/components/ui/DeliverySection";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Delivery — FullerHome",
  description:
    "How a real FullerHome project would be run: five lean takts, visible buffers, DIN 276 cost structure and deviation handling.",
};

export default function DeliveryPage() {
  return (
    <main className={styles.main}>
      <div className={styles.pageWrap}>
        <DeliverySection />
      </div>
    </main>
  );
}
