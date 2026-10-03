/**
 * Single source for action labels and microcopy, so the same action is never
 * named two different ways across the site.
 */
export const cta = {
  order: "اطلب دلوقتي",
  browse: "شوف المنيو",
  add: "أضف للسلة",
  checkout: "كمّل الطلب",
  confirm: "أكّد الطلب",
} as const;

export const microcopy = {
  added: ["اختيار محترم.", "ذوقك عالي.", "كده الأكلة بدأت تحلو.", "ده الكلام."],
  cartEmptyTitle: "السلة فاضية…",
  cartEmptyBody: "وده وضع محتاج يتصلح.",
  success: "خلاص، الأكل جاي.",
  searchEmpty: "مالقيناش حاجة بالاسم ده.",
  unavailable: "مش متاح دلوقتي",
  closed: "الطلبات مقفولة دلوقتي — تقدر تتفرج على المنيو وترجع لنا.",
} as const;

export function pickAddedLine(seed: number): string {
  return microcopy.added[seed % microcopy.added.length];
}
