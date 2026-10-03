import type { RecommendationRule } from "@/data/recommendations";
import type { Product } from "@/types/menu";
import type { MenuIndex } from "./pricing";

export interface Recommendation {
  rule: Pick<RecommendationRule, "id" | "title" | "kicker" | "line">;
  products: Product[];
}

/**
 * Picks the first rule that matches the cart and returns up to `max` available
 * products the cart doesn't already contain. Product-level `recommendations`
 * of items in the cart come first.
 */
export function recommendFor(
  cartProductIds: string[],
  index: MenuIndex,
  rules: RecommendationRule[],
): Recommendation | null {
  const inCart = cartProductIds.map((id) => index.get(id)).filter((p): p is Product => Boolean(p));
  if (!inCart.length) return null;

  const hits = (sel: { categoryIds?: string[]; productIds?: string[] } | undefined) =>
    Boolean(sel) && inCart.some((p) => sel!.categoryIds?.includes(p.categoryId) || sel!.productIds?.includes(p.id));

  const rule = rules.find((r) => hits(r.when) && !hits(r.unless));
  if (!rule) return null;

  const cartIds = new Set(inCart.map((p) => p.id));
  const pool = [...index.values()].filter((p) => p.available && !cartIds.has(p.id));
  const fits = (p: Product) => rule.suggest.categoryIds?.includes(p.categoryId) || rule.suggest.productIds?.includes(p.id);
  // A product's own pairings come first — but only those that fit this rule.
  const explicit = inCart.flatMap((p) => p.recommendations ?? []).map((id) => index.get(id)).filter((p): p is Product => Boolean(p && fits(p)));
  const byRule = pool.filter(fits);

  const ordered: Product[] = [];
  for (const p of [...explicit, ...byRule]) {
    if (p && p.available && !cartIds.has(p.id) && !ordered.includes(p)) ordered.push(p);
  }
  const products = ordered.slice(0, rule.max ?? 3);
  return products.length ? { rule, products } : null;
}
