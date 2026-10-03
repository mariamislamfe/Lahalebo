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
