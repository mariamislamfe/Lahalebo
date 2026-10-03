/**
 * Cart recommendations — evaluated live against the cart, shown inline in it.
 * The first rule that matches wins; once satisfied (e.g. a dessert is added),
 * the next rule can surface. Product-level `recommendations` go first.
 */
export interface RecommendationRule {
  id: string;
  /** Fires when the cart contains any of these. */
  when: { categoryIds?: string[]; productIds?: string[] };
  /** Skipped when the cart already contains any of these. */
  unless?: { categoryIds?: string[]; productIds?: string[] };
  suggest: { categoryIds?: string[]; productIds?: string[] };
  title: string;
  kicker?: string;
  line?: string;
  max?: number;
}

const SAVORY = ["koshary", "tawagen", "pasta", "fateer-salty", "pizza"];

export const recommendationRules: RecommendationRule[] = [
  {
    id: "sweet-finish",
    when: { categoryIds: SAVORY },
    unless: { categoryIds: ["desserts", "fateer-sweet"] },
    suggest: { categoryIds: ["desserts", "fateer-sweet"] },
    title: "طب نحلّيها؟",
    // Lahalebo's own campaign line.
    line: "معلقة تولّع من هنا… ومعلقة تبرد من هنا.",
    max: 3,
  },
  {
    id: "cold-drink",
    when: { categoryIds: [...SAVORY, "desserts", "fateer-sweet"] },
    unless: { categoryIds: ["drinks"] },
    suggest: { categoryIds: ["drinks"] },
    title: "وحاجة ساقعة معاها؟",
    max: 3,
  },
];
