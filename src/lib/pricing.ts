import type { Menu, Product } from "@/types/menu";

/**
 * Pure pricing logic shared by the cart (display) and the order API (source of truth).
 * The server always re-prices from its own menu and ignores client totals.
 * A `null` price means "not supplied yet": the line is still orderable and the
 * total is confirmed with the customer.
 */

export interface LineInput {
  productId: string;
  optionId?: string;
  extraIds: string[];
  choiceIds: string[];
  qty: number;
}

export interface PricedLine extends LineInput {
  product: Product;
  optionName?: string;
  extraNames: string[];
  choiceNames: string[];
  unitPrice: number | null;
  lineTotal: number | null;
}

export type LineProblem = "unknown-product" | "unavailable" | "invalid-option" | "invalid-extra" | "invalid-choice";

export type MenuIndex = Map<string, Product>;

export function indexMenu(menu: Menu): MenuIndex {
  return new Map(menu.products.map((p) => [p.id, p]));
}

/** Lowest orderable price, or null when unknown — used for "من X ج.م" labels. */
export function startingPrice(product: Product): number | null {
  const opts = product.options?.filter((o) => o.available !== false);
  if (!opts?.length) return product.price;
  const known = opts.map((o) => o.price).filter((p): p is number => p !== null);
  return known.length ? Math.min(...known) : null;
}

export function needsConfiguration(product: Product): boolean {
  return Boolean(product.options?.length || product.extras?.length || product.choices?.length);
}

export function defaultOptionId(product: Product): string | undefined {
  return product.options?.find((o) => o.available !== false)?.id;
}

export function priceLine(
  index: MenuIndex,
  line: LineInput,
): { ok: true; line: PricedLine } | { ok: false; problem: LineProblem } {
  const product = index.get(line.productId);
  if (!product) return { ok: false, problem: "unknown-product" };
  if (!product.available) return { ok: false, problem: "unavailable" };

  let base = product.price;
  let optionName: string | undefined;
  if (product.options?.length) {
    const option = product.options.find((o) => o.id === line.optionId);
    if (!option || option.available === false) return { ok: false, problem: "invalid-option" };
    base = option.price;
    optionName = option.name;
  } else if (line.optionId) {
    return { ok: false, problem: "invalid-option" };
  }

  const extraIds = [...new Set(line.extraIds)];
  const extraNames: string[] = [];
  let extrasTotal: number | null = 0;
  for (const id of extraIds) {
    const extra = product.extras?.find((e) => e.id === id);
    if (!extra || extra.available === false) return { ok: false, problem: "invalid-extra" };
    extrasTotal = extrasTotal === null || extra.price === null ? null : extrasTotal + extra.price;
    extraNames.push(extra.name);
  }

  const choiceIds = [...new Set(line.choiceIds)];
  const choiceNames: string[] = [];
  for (const id of choiceIds) {
    const choice = product.choices?.find((c) => c.id === id);
    if (!choice) return { ok: false, problem: "invalid-choice" };
    choiceNames.push(choice.name);
  }

  const unitPrice = base === null || extrasTotal === null ? null : base + extrasTotal;
  return {
    ok: true,
    line: {
      ...line,
      extraIds,
      choiceIds,
      product,
      optionName,
      extraNames,
      choiceNames,
      unitPrice,
      lineTotal: unitPrice === null ? null : unitPrice * line.qty,
    },
  };
}

/** Sum of known line totals; `complete` is false when any line has no price yet. */
export function sumLines(lines: PricedLine[]): { total: number; complete: boolean } {
  let total = 0;
  let complete = true;
  for (const l of lines) {
    if (l.lineTotal === null) complete = false;
    else total += l.lineTotal;
  }
  return { total, complete };
}

/** Stable identity for "same product, same choices" so repeats merge into one cart line. */
export function lineKey(line: Pick<LineInput, "productId" | "optionId" | "extraIds" | "choiceIds">): string {
  return [
    line.productId,
    line.optionId ?? "-",
    [...line.extraIds].sort().join(","),
    [...line.choiceIds].sort().join(","),
  ].join("|");
}
