"use client";

import type { Product, Surface } from "@/types/menu";
import { cn } from "@/lib/format";
import { startingPrice } from "@/lib/pricing";
import { useOpenProduct } from "@/store/product-sheet-context";
import { FoodImage, surfaceClass } from "@/components/ui/FoodImage";
import { PriceFlag } from "@/components/ui/PriceFlag";
import { AddControl } from "./AddControl";

/**
 * HERO card — the category's lead dish. Oversized: the food breaks out of
 * its colour field; name set big; price flag snaps on when it arrives.
 */
export function HeroDishCard({ product, surface }: { product: Product; surface: Surface }) {
  const openProduct = useOpenProduct();
  const onDark = surface !== "cream";
  return (
    <article className={cn("group relative flex h-full min-h-[24rem] flex-col justify-end overflow-visible rounded-panel p-5 md:min-h-[30rem] md:p-8", surfaceClass[surface], onDark ? "text-cream" : "text-coal")}>
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        aria-label={`تفاصيل ${product.name}`}
        className="absolute inset-x-[6%] -top-[10%] bottom-[36%] md:-top-[14%]"
      >
        <FoodImage
          image={product.image}
          label={product.name}
          sizes="(min-width: 1024px) 50vw, 92vw"
          className={cn("size-full", !product.image?.cutout && "overflow-hidden rounded-card shadow-pop")}
          imgClassName="transition-transform duration-700 ease-food group-hover:scale-[1.05] group-hover:-rotate-2"
        />
      </button>
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <h4 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[0.95] font-extrabold">{product.name}</h4>
          {product.tagline && <p className={cn("mt-1 text-[17px] font-medium", onDark ? "text-cream/85" : "text-smoke")}>{product.tagline}</p>}
          <div className="flag-snap mt-3 w-fit">
            <PriceFlag value={startingPrice(product)} from={Boolean(product.options?.length)} size="lg" tone={onDark ? "cream" : "chili"} />
          </div>
        </div>
        <AddControl product={product} />
      </div>
    </article>
  );
}

/** COMPACT row — small thumb that still breaks its frame, name, flag, +. */
export function CompactDishCard({ product, surface }: { product: Product; surface: Surface }) {
  const openProduct = useOpenProduct();
  return (
    <article className="group relative flex items-center gap-4 rounded-card bg-white p-3 pe-4 shadow-card">
      <button
        type="button"
        onClick={() => openProduct(product.id)}
        aria-label={`تفاصيل ${product.name}`}
        className={cn("relative size-28 shrink-0 rounded-2xl md:size-32", surfaceClass[surface])}
      >
        <FoodImage
          image={product.image}
          label={product.name}
          sizes="128px"
          className={cn("absolute", product.image?.cutout ? "-inset-[10%]" : "inset-0 overflow-hidden rounded-2xl")}
          imgClassName="transition-transform duration-500 ease-food group-hover:scale-110 group-hover:rotate-3"
        />
      </button>
      <div className="min-w-0 flex-1">
        <h4 className="font-display text-dish font-extrabold">
          <button type="button" onClick={() => openProduct(product.id)} className="text-start hover:text-chili">
            {product.name}
          </button>
        </h4>
        {product.tagline && <p className="mt-0.5 truncate text-sm text-smoke">{product.tagline}</p>}
        <div className="flag-snap mt-2 w-fit">
          <PriceFlag value={startingPrice(product)} from={Boolean(product.options?.length)} size="sm" />
        </div>
      </div>
      <AddControl product={product} variant="round" />
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-4 rounded-card bg-white p-3">
      <div className="skeleton size-28 rounded-2xl" />
      <div className="flex-1 space-y-2 pt-2">
        <div className="skeleton h-6 w-2/3 rounded-full" />
        <div className="skeleton h-4 w-1/3 rounded-full" />
      </div>
    </div>
  );
}
