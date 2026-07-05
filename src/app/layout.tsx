import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "@/styles/globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "FullerHome — Robotic Dome Builder",
  description: "Geodesic dome construction simulation with industrial robot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
