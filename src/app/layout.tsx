import type { Metadata, Viewport } from "next";
import { Onest, Roboto_Slab } from "next/font/google";
import "./globals.css";

const slab = Roboto_Slab({
  variable: "--font-slab",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "URBO coffee — кофе для тех, кто в ритме города",
  description:
    "Сеть кофеен URBO: 50+ кофеен в Алматы и области. Кофе, завтраки и боулы. Найдите ближайшую кофейню на карте.",
  openGraph: {
    title: "URBO coffee",
    description: "Кофе, завтраки и боулы для тех, кто в ритме города. 50+ кофеен.",
    locale: "ru_KZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#651a26",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${slab.variable} ${onest.variable} antialiased`}>
      <body>
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}[data-intro]{display:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
