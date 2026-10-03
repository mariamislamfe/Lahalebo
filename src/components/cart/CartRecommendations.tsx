"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Recommendation } from "@/lib/recommendations";
import { useAddToCart } from "@/hooks/useAddToCart";
import { needsConfiguration, startingPrice } from "@/lib/pricing";
import { useOpenProduct } from "@/store/product-sheet-context";
import { useMenu } from "@/store/menu-context";
import { FoodImage } from "@/components/ui/FoodImage";
import { PlusIcon } from "@/components/ui/Icons";
import { PriceFlag } from "@/components/ui/PriceFlag";

/**
 * Inline in the cart: "إيه رأيك تحلّي؟" next to what you ordered. One tap adds
 * without leaving the cart; when that need is met the next rule takes over.
 */
export function CartRecommendations({ recommendation }: { recommendation: Recommendation | null }) {
  const addToCart = useAddToCart();
  const openProduct = useOpenProduct();
  const { categoryById } = useMenu();

  return (
    <AnimatePresence mode="wait">
      {recommendation && (
        <motion.section
          key={recommendation.rule.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-label={recommendation.rule.title}
          className="my-4 rounded-[1.5rem] bg-leaf p-4 text-cream"
        >
          <p className="font-display text-2xl leading-none font-extrabold">{recommendation.rule.title}</p>
          {recommendation.rule.line && <p className="mt-1 text-[13px] text-cream/80">{recommendation.rule.line}</p>}
          <ul className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
            {recommendation.products.map((p) => (
              <li key={p.id} className="w-40 shrink-0 snap-start rounded-2xl bg-cream p-2 text-coal">
                <button type="button" onClick={() => openProduct(p.id)} className="block w-full" aria-label={`تفاصيل ${p.name}`}>
                  <FoodImage
                    image={p.image}
                    label={p.name}
                    surface={categoryById.get(p.categoryId)?.surface ?? "cream"}
                    sizes="160px"
                    className="aspect-[4/3] overflow-hidden rounded-xl"
                    grounded={false}
                  />
                </button>
                <p className="font-display mt-2 truncate px-1 text-lg leading-tight font-extrabold">{p.name}</p>
                <div className="mt-1 flex items-center justify-between px-1">
                  <PriceFlag value={startingPrice(p)} size="sm" />
                  <button
                    type="button"
                    aria-label={`أضف ${p.name}`}
                    onClick={(e) => (needsConfiguration(p) ? openProduct(p.id) : addToCart({ productId: p.id }, e.currentTarget))}
                    className="grid size-9 place-items-center rounded-full bg-chili text-cream transition-transform duration-200 ease-snap active:scale-90"
                  >
                    <PlusIcon size={18} strokeWidth={2.8} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

