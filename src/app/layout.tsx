import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

import { MarketStoreProvider } from "@/components/market-store";
import { SiteShell } from "@/components/site-shell";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const FAVICON =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%230F8B8D'/><circle cx='16' cy='16' r='5' fill='%23FFFFFF'/><path d='M8 21 C12 14 18 14 22 18 L25 15' stroke='%230B1320' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>";

export const metadata: Metadata = {
  title: "FolioX — Trade creator assets across every medium",
  description:
    "FolioX — A cross-media creator asset exchange where IP owners tokenise channels, videos, games, books, films, music and UGC so fans can buy, hold and trade revenue-share assets.",
  icons: { icon: FAVICON },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <MarketStoreProvider>
          <SiteShell>{children}</SiteShell>
        </MarketStoreProvider>
      </body>
    </html>
  );
}
