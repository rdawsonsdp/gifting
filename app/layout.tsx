import type { Metadata, Viewport } from "next";
import { Playfair_Display, Open_Sans } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { GiftProvider } from "@/context/GiftContext";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Corporate Gifting | Brown Sugar Bakery Chicago",
  description: "Send handcrafted candy gifts to your clients, employees, and partners. Budget-based corporate gifting made simple.",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Brown Sugar Bakery Gifting',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#5D4037',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${openSans.variable} antialiased`}
      >
        <GiftProvider>
          <Layout>
        {children}
          </Layout>
        </GiftProvider>
      </body>
    </html>
  );
}
