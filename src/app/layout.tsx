import type { Metadata, Viewport } from "next";
import { Badeen_Display, Marhey, Readex_Pro } from "next/font/google";
import { siteConfig } from "@/config/site";
import { motionBootScript } from "@/lib/motion-pref";
import "./globals.css";

/**
 * Type system (see docs/creative-direction.md):
 * Badeen Display = the shout. Heavy, blocky, Egyptian sign-painter energy. One weight only.
 * Marhey         = the voice. Hand-painted and playful: dish names, the brand talking.
 * Readex Pro     = the UI. Prices, buttons, forms — everything you must read fast.
 */
const badeen = Badeen_Display({
  variable: "--font-badeen",
  subsets: ["arabic", "latin"],
  weight: "400",
  display: "swap",
  // no metric overrides exist for Badeen; it only sets big display words anyway
  adjustFontFallback: false,
});

const marhey = Marhey({
  variable: "--font-marhey",
  subsets: ["arabic", "latin"],
  weight: ["500", "700"],
  display: "swap",
});

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} كشري | مش عارف تاكل إيه؟`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.nameEn,
  keywords: ["لهاليبو", "Lahalebo", "كشري لهاليبو", "كشري", "دليفري كشري", "19138"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: siteConfig.name,
    title: `${siteConfig.name} كشري | مش عارف تاكل إيه؟`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f26a1b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Restaurant schema with ONLY verified fields (name, hotline, Facebook).
 * Address, hours and priceRange are omitted until real data exists.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: siteConfig.name,
  alternateName: siteConfig.nameEn,
  url: siteConfig.url,
  logo: `${siteConfig.url}${siteConfig.logo.src}`,
  servesCuisine: ["Egyptian", "Koshary"],
  hasMenu: `${siteConfig.url}/#menu`,
  telephone: siteConfig.contact.hotline,
  sameAs: [siteConfig.social.facebook].filter(Boolean),
  acceptsReservations: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${badeen.variable} ${marhey.variable} ${readex.variable} antialiased`}>
      <body className="min-h-dvh">
        {/* Before paint: enables reveal styles (JS only) and sets the motion mode.
            Lives in <body>, not <head>: antivirus/extensions (e.g. Kaspersky) inject
            scripts into <head>, which would break hydration matching there. */}
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
