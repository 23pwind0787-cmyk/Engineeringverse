import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} | ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: { title: siteConfig.name, description: siteConfig.description, siteName: siteConfig.name, type: "website" },
  twitter: { card: "summary", title: siteConfig.name, description: siteConfig.description },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://engineeringverse.me/#organization",
      name: "EngineeringVerse",
      url: "https://engineeringverse.me/",
      description:
        "An independent student-run resource for engineering students: UET Peshawar past papers, department guides, and engineering software news researched from official sources.",
      foundingDate: "2026",
    },
    {
      "@type": "WebSite",
      "@id": "https://engineeringverse.me/#website",
      url: "https://engineeringverse.me/",
      name: "EngineeringVerse",
      publisher: { "@id": "https://engineeringverse.me/#organization" },
      inLanguage: "en",
    },
  ],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
