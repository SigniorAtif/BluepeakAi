import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BOOT, INTRO_GUARD } from "@/components/prefs";
import "./globals.css";
import "./site.css";

const sans = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://bluepeakai.in"),
  title: { default: "BluePeakAI · Ideas that automate. Strategies that grow.", template: "%s · BluePeakAI" },
  description:
    "BluePeakAI builds business websites, AI automation, chatbots and WhatsApp systems for businesses in India and abroad. Founded by Ayushi Shah in Vadodara.",
  // Kept out of search until BluePeakAI takes it over.
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E0D" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable + " " + mono.variable} data-theme="dark" data-accent="glacier" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_GUARD }} />
      </head>
      {/* Browser extensions (Grammarly) write attributes onto <body> before React hydrates. */}
      <body suppressHydrationWarning>
        <a href="#main" className="skip">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
