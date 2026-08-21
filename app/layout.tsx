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
  title: "bidopensource.lol – The Open Source Auction Board & Leaderboard",
  description:
    "No ads, no algorithms, no gatekeepers. Outbid your competition to claim the #1 crown for your open source project or developer tool.",
  openGraph: {
    title: "bidopensource.lol – The Open Source Auction Board",
    description:
      "Outbid your competition to claim the #1 crown for your open-source repo or developer tool.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d13] text-[#e6edf3] font-sans selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
