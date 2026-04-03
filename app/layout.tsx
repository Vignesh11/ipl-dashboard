import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPL Stats Dashboard",
  description: "IPL Auction League Stats — 2020 to 2026",
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
