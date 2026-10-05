/**
 * «زوّد براحتك» — the condiment counter.
 * Each entry points at a real side product in data/menu.ts (price, name and
 * photo come from there). `vessel` decides how the object reacts to a tap:
 * bottles tilt and pour, bowls get a scoop.
 */
export interface CondimentSpot {
  productId: string;
  vessel: "bottle" | "bowl";
  /** Colour of the drops/crumbs that fly off when you add one. */
  tint: string;
  /** One short line in Lahalebo's voice. */
  line: string;
}

export const condimentStation: CondimentSpot[] = [
  { productId: "side-shatta", vessel: "bottle", tint: "#8e1a0e", line: "على قد ما تستحمل" },
  { productId: "side-da2a", vessel: "bottle", tint: "#b8741f", line: "خل وتوم" },
  { productId: "side-salsa", vessel: "bowl", tint: "#d7381b", line: "حمرا وسخنة" },
  { productId: "side-ta2leya", vessel: "bowl", tint: "#b8692a", line: "بصل مقرمش" },
  { productId: "side-hummus", vessel: "bowl", tint: "#e3a63c", line: "حبة زيادة" },
  { productId: "side-lentils", vessel: "bowl", tint: "#5b3b22", line: "عشان الطبق يتقل" },
];
