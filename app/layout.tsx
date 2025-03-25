import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/navbar";
import { FirebaseProvider } from "@/components/firebase-provider";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sen Jewels | Handcrafted Jewelry | Glass Beads & Gemstones",
  description:
    "Discover exquisite handcrafted jewelry by Sen Jewels. Explore our unique collection of glass bead and precious gemstone jewelry. Shop now for stunning, artisan-made pieces.",
  keywords: [
    "handmade jewelry",
    "Senjuti Biswas",
    "Sen Jewels",
    "glass bead bracelets",
    "gemstone necklaces",
    "UK artisan jewelry",
    "handcrafted gifts",
    "affordable handmade jewelry",
    "beaded accessories",
    "boho jewelry",
    "support small business",
    "handmade glass bead bracelets for women",
    "unique gemstone necklace online UK",
    "buy handmade jewelry online",
    "artisanal jewelry",
    "amethyst necklaces",
    "murano glass bead bracelets",
    "handmade jewelry for gifts",
    "unique jewelry for any budget",
  ],
  generator: "v0.dev",
  openGraph: {
    title: "Sen Jewels | Handcrafted Jewelry | Glass Beads & Gemstones",
    description:
      "Discover exquisite handcrafted jewelry by Sen Jewels. Explore our unique collection of glass bead and precious gemstone jewelry. Shop now for stunning, artisan-made pieces.",
    url: "https://senjewels.co.uk/",
    siteName: "Sen Jewels",
    images: [
      {
        url: "https://senjewels.co.uk/images/sen-jewels-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sen Jewels Handcrafted Jewelry",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sen Jewels | Handcrafted Jewelry | Glass Beads & Gemstones",
    description:
      "Discover exquisite handcrafted jewelry by Sen Jewels. Explore our unique collection of glass bead and precious gemstone jewelry. Shop now for stunning, artisan-made pieces.",
    images: ["https://senjewels.co.uk/images/sen-jewels-twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://senjewels.co.uk/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      {/* ✅ Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-ZSV4YNGP2R"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZSV4YNGP2R', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <body className={`${inter.className} bg-[#b5e8e0] min-h-screen relative`}>
        <FirebaseProvider>
          <CookieConsent /> {/* ✅ Cookie banner site-wide */}
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <footer className="bg-white/80 py-6">
              <div className="container mx-auto px-4 text-center">
                <p className="text-gray-700">
                  © {new Date().getFullYear()} Sen Jewels. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Handcrafted with love by Senjuti Biswas
                </p>
              </div>
            </footer>
          </div>
        </FirebaseProvider>
      </body>
    </html>
  );
}
