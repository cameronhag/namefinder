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
  metadataBase: new URL('https://nameclaim.xyz'),
  title: {
    default: 'NameClaim — Check business name availability across trademark, domain, and social',
    template: '%s | NameClaim',
  },
  description:
    'Check if your business name is available across federal trademarks, domain registrars, and social media handles. One search, one verdict, ten seconds. Free, no signup.',
  keywords: [
    'business name checker',
    'business name availability',
    'trademark search',
    'free trademark check',
    'domain availability checker',
    'social handle availability',
    'startup name search',
    'company name generator',
  ],
  openGraph: {
    type: 'website',
    url: 'https://nameclaim.xyz',
    title: 'NameClaim — Claim a name no one can take from you',
    description:
      'Trademark, domain, and social handle availability in one search. Free, ten seconds.',
    siteName: 'NameClaim',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NameClaim — Claim a name no one can take from you',
    description:
      'Trademark, domain, and social handle availability in one search. Free, ten seconds.',
  },
  alternates: {
    canonical: 'https://nameclaim.xyz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NameClaim',
  url: 'https://nameclaim.xyz',
  description:
    'Free tool to check business name availability across federal trademarks, domain registrars, and social media handles.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Federal trademark search (USPTO)',
    'Domain availability across 18+ TLDs',
    'Social handle availability on Instagram, TikTok, LinkedIn',
    'Unified verdict (green/yellow/red)',
  ],
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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PHProvider>{children}</PHProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
