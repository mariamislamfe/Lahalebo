"use client";

import type { Product } from "@/types/menu";
import { cta, microcopy } from "@/content/copy";
import { siteConfig } from "@/config/site";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cn, formatNumber } from "@/lib/format";
import { lineKey, needsConfiguration } from "@/lib/pricing";
import { useCart } from "@/store/cart-context";
import { useOpenProduct } from "@/store/product-sheet-context";
import { PlusIcon } from "@/components/ui/Icons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

/**
 * Ordering control on a product (fast motion: snap).
 * Simple products: tap → flies into the cart, then becomes a stepper.
 * Configurable products: opens the sheet; a badge counts what's in the cart.
 */
export function AddControl({
  product,
  variant = "pill",
  tone = "chili",
}: {
  product: Product;
  variant?: "pill" | "round";
  /** "inverse" = cream button for red fields. */
  tone?: "chili" | "inverse";
}) {
  const { lines, setQty, qtyOf, hydrated } = useCart();
  const addToCart = useAddToCart();
  const openProduct = useOpenProduct();

  const configurable = needsConfiguration(product);
  const inCart = hydrated ? qtyOf(product.id) : 0;

  if (!product.available) {
    return <span className="inline-flex h-10 items-center rounded-full bg-coal px-4 text-[13px] font-bold text-cream">{microcopy.unavailable}</span>;
  }

  if (!configurable && inCart > 0) {
    const key = lineKey({ productId: product.id, extraIds: [], choiceIds: [] });
    const line = lines.find((l) => l.key === key);
    return (
      <QuantityStepper
        value={line?.qty ?? inCart}
        onChange={(q) => setQty(key, q)}
        removable
        label={product.name}
        tone="chili"
        size={variant === "round" ? "sm" : "md"}
      />
    );
  }

  const badge = inCart > 0 && (
    <span
      aria-label={`${formatNumber(inCart)} في السلة`}
      className="absolute -top-1.5 -left-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-leaf px-1 text-xs font-bold text-cream ring-2 ring-cream"
    >
      {formatNumber(inCart)}
    </span>
  );

  return (
    <button
      type="button"
      onClick={(e) => (configurable ? openProduct(product.id) : addToCart({ productId: product.id }, e.currentTarget))}
      disabled={!siteConfig.ordering.open}
      aria-label={`${cta.add}: ${product.name}`}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold shadow-cta",
        "transition-[transform,background-color] duration-200 ease-snap active:scale-90 disabled:opacity-45",
        tone === "inverse" ? "bg-cream text-chili hover:bg-white" : "bg-chili text-cream hover:bg-chili-deep",
        variant === "round" ? "size-11" : "h-12 ps-4 pe-5 text-[16px]",
      )}
    >
      <PlusIcon size={variant === "round" ? 22 : 20} strokeWidth={2.8} />
      {variant === "pill" && cta.add}
      {badge}
    </button>
  );
}
