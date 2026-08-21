import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "outbid.lol – Outbid Your Competition",
  description:
    "No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top. Will you take #1 when this site goes viral?",
  openGraph: {
    title: "outbid.lol – Outbid Your Competition",
    description:
      "No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
