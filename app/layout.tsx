import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/*  BRAND NOTE
 *  Telenor/Grameenphone specify a licensed corporate typeface.
 *  Inter is used here as a metrically-similar stand-in so the build runs
 *  without the licensed files. To go live, drop the .woff2 files into
 *  /public/fonts and swap this for next/font/local — nothing else changes,
 *  because every component reads --font-sans / --font-mono.
 */
const sans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ai&i · Grameenphone",
  description:
    "A short calibration on how you think about AI. Three questions, two minutes, one invitation.",
};

export const viewport: Viewport = {
  themeColor: "#03050e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
