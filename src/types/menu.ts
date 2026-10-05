/**
 * Menu domain types.
 * Shaped to map 1:1 onto a future REST/Prisma schema. Prices are whole
 * Egyptian pounds; `null` means "not supplied yet" and is shown honestly.
 */

/** Colour field a dish sits on (with heat light behind it). */
export type Surface = "orange" | "red" | "leaf" | "cream";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Transparent PNG cutout (placed on a surface) vs. full-bleed photo. */
  cutout?: boolean;
  /** CSS object-position for art-directed crops of full photos. */
  focus?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** How the craving picker phrases it — the mood, not the category. */
  craving: string;
  surface: Surface;
  image?: ProductImage;
  sortOrder: number;
  available: boolean;
}

/** Single-choice variant (e.g. size). `price` is the absolute price in this variant. */
export interface ProductOption {
  id: string;
  name: string;
  price: number | null;
  available?: boolean;
}

/** Paid multi-choice add-on. */
export interface Extra {
  id: string;
  name: string;
  price: number | null;
  available?: boolean;
  /** Real photo crop of the add-on itself (bowl of hummus, bottle of da2a…). */
  image?: ProductImage;
}

/** Free preference, e.g. "بصل كتير". */
export interface Choice {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  /** Only real, supplied copy — never invented. */
  description?: string;
  /** Short brand line (from Lahalebo's own campaigns where possible). */
  tagline?: string;
  /** Small label on the dish, e.g. "الأكثر طلبًا". */
  badge?: string;
  /** Base price. `null` until supplied. Ignored when `options` exist. */
  price: number | null;
  image?: ProductImage;
  categoryId: string;
  available: boolean;
  featured?: boolean;
  optionsLabel?: string;
  options?: ProductOption[];
  extras?: Extra[];
  choicesLabel?: string;
  choices?: Choice[];
  /** Explicit cross-sell targets; merged ahead of rule-based recommendations. */
  recommendations?: string[];
}

export interface Menu {
  categories: Category[];
  products: Product[];
}
