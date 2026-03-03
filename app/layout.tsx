import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Rudd Report",
  description: "Intelligence. Cybersecurity. Geopolitics. National Security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}