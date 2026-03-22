import type { Metadata } from "next";
import "./globals.css";
import SearchModal from "./components/SearchModal";

export const metadata: Metadata = {
  title: "The Rudd Report",
  description: "Unclassified intelligence. Strategic analysis on cybersecurity, national security, geopolitics, and the forces reshaping the global order.",
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
  return (
    <html lang="en">
      <body>
        {children}
        <SearchModal />
      </body>
    </html>
  );
}
