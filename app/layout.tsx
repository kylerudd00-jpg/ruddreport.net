import type { Metadata } from "next";
import "./globals.css";
import SearchModal from "./components/SearchModal";
import Nav from "./components/Nav";
import IntroLoader from "./components/IntroLoader";
import SmoothScroll from "./components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "The Rudd Report",
  description: "Independent writing on cybersecurity, national security, and geopolitics.",
  metadataBase: new URL('https://ruddreport.net'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    siteName: 'The Rudd Report',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@KyleRudd44',
    creator: '@KyleRudd44',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://ruddreport.net/feed.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // suppressHydrationWarning: the pre-paint script below adds .rr-js to
  // <html> before hydration (attribute-level, this element only)
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* pre-paint marker: reveal-hidden styles apply only when JS runs */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('rr-js')" }} />
        <IntroLoader />
        <SmoothScroll />
        <Nav />
        {children}
        <SearchModal />
        <Analytics />
      </body>
    </html>
  );
}
