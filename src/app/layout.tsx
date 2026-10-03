import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Kufam } from "next/font/google";
import { siteConfig } from "@/config/site";
import { motionBootScript } from "@/lib/motion-pref";
import "./globals.css";

/**
 * Type system — its own identity, unrelated to Toma (Lalezar / Cairo / Ruqaa):
 * Kufam            = modern geometric Kufi with a street-sign edge. Loud display.
 * IBM Plex Sans AR = calm, very readable text for menus, prices and forms.
 */
const kufam = Kufam({
  variable: "--font-kufam",
  subsets: ["arabic", "latin"],
  weight: ["700", "900"],
  display: "swap",
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} كشري | جعان؟ يلا نطلب`,
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
    title: `${siteConfig.name} كشري | جعان؟ يلا نطلب`,
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
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${kufam.variable} ${plex.variable} antialiased`}>
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
