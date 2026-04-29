import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import "@/app/globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Faste Coffee",
  description: "Premium scrollytelling landing page for Faste Coffee."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-page">
      <body className={`${outfit.variable} font-sans text-cream antialiased`}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
