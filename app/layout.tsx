import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Self-hosted Inter (zero CLS) — Minimal Swiss pairing for dashboards.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "CivicRide — Agency ride dispatch", template: "%s · CivicRide" },
  description: "Multi-tenant SaaS for agency ride scheduling, dispatch and driver execution.",
  icons: { icon: "/brand/mark.png", apple: "/brand/mark.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-brand-700 focus:p-2 focus:text-white"
        >
          Skip to content
        </a>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
