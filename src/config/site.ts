import type { ProductImage } from "@/types/menu";

/**
 * Business configuration.
 *
 * Everything here that is `null` is UNKNOWN on purpose — do not fill it with
 * guesses. The UI hides or softens anything that is missing.
 */
export const siteConfig = {
  name: "لهاليبو",
  nameEn: "Lahalebo",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description: "لهاليبو كشري — جعان؟ اختار اللي نفسك فيه واطلبه، أو كلّمنا على ١٩١٣٨.",

  /** Real sticker logo supplied by the client (trimmed copy of /public/logo.jpg). */
  logo: { src: "/brand/logo.png", width: 396, height: 165 },

  /**
   * TODO(client): the hero photo. Until it's supplied the hero shows an empty
   * tilted white frame in its place. Put the file in /public and set e.g.
   * { src: "/hero/koshary.png", alt: "علبة كشري لهاليبو", width: 1200, height: 900 }.
   */
  heroImage: null as ProductImage | null,

  contact: {
    /** Printed on Lahalebo packaging and posts. */
    hotline: "19138",
    /** TODO(client): other verified numbers. */
    phone: null as string | null,
  },
  social: {
    /** From the watermark on Lahalebo's posts. */
    facebook: "https://www.facebook.com/lahaleborestaurant" as string | null,
    instagram: null as string | null,
    tiktok: null as string | null,
  },

  ordering: {
    /** Flip to false to show the "closed" state across the site. */
    open: true,
    /** TEMPORARY delivery fee in EGP — replace with the real one. */
    deliveryFee: 15 as number | null,
    /** TODO(business): minimum order in EGP, if any. */
    minOrder: null as number | null,
    fulfillment: ["delivery", "pickup"] as const,
    payment: ["cash"] as const,
  },

  /** Internal flags (not shown in the UI): the menu/prices are temporary. */
  placeholders: {
    prices: false,
    menu: true,
  },
} as const;

export type Fulfillment = (typeof siteConfig.ordering.fulfillment)[number];
export type PaymentMethod = (typeof siteConfig.ordering.payment)[number];
