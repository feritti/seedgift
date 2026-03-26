import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeedGift — Plant a Financial Seed for the Child You Love",
  description:
    "Give children financial gifts that grow. SeedGift makes it easy to invest birthday, holiday, and milestone gifts in the S&P 500.",
  metadataBase: new URL("https://www.seedgift.xyz"),
  openGraph: {
    title: "SeedGift — Plant a Financial Seed for the Child You Love",
    description:
      "Skip the toy aisle. Give children financial gifts that actually grow over time.",
    siteName: "SeedGift",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SeedGift — Plant a Financial Seed for the Child You Love",
    description:
      "Skip the toy aisle. Give children financial gifts that actually grow over time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
