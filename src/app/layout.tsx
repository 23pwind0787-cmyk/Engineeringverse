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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: { title: siteConfig.name, description: siteConfig.description, siteName: siteConfig.name, type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: siteConfig.name }] },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.description, images: ["/og.png"] },
  appleWebApp: { capable: true, title: "EngineeringVerse", statusBarStyle: "default" },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://engineeringverse.me/#organization",
      name: "EngineeringVerse",
      url: "https://engineeringverse.me/",
      logo: "https://engineeringverse.me/logo.svg",
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

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0B1F33" };

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
