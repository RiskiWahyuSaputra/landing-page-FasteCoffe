import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import "./globals.css";
import AppShell from "@/components/AppShell";
import LocaleProvider from "@/components/LocaleProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Faste Coffee",
  description: "Premium scrollytelling landing page for Faste Coffee.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";

  return (
    <html lang={locale} className="bg-page">
      <body className={`${outfit.variable} font-sans text-cream antialiased`}>
        <LocaleProvider>
          <AppShell>{children}</AppShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
