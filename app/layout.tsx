import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PHProvider } from "./providers";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NameClaim — Check business name availability across trademark, domain, and social",
  description: "Find a business name you can actually own. Check trademark, domain, and social media availability in a single search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{ backgroundColor: 'white' }}
      className={`${figtree.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" />
      </head>
      <body className="min-h-full flex flex-col">
        <PHProvider>{children}</PHProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}