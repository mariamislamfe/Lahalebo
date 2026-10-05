"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { recommendationRules } from "@/data/recommendations";
import { useAddToCart } from "@/hooks/useAddToCart";
import { formatPrice } from "@/lib/format";
import { needsConfiguration, startingPrice } from "@/lib/pricing";
import { recommendFor } from "@/lib/recommendations";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { useOpenProduct } from "@/store/product-sheet-context";
import { CloseIcon, PlusIcon } from "@/components/ui/Icons";

/**
 * «طب نحلّيها؟» — the restaurant suggesting dessert, the way a waiter would:
 * once, after you add something savory, as a small ticket in the corner.
 * Not a modal; never blocks the page; gone for the visit once dismissed or
 * once something sweet is in the order. Desserts land light (soft spring).
 */
const RULE = recommendationRules.find((r) => r.id === "sweet-finish");
const SEEN_KEY = "lahalebo.sweet-nudge";

export function SweetNudge() {
  const { lines, addTick, lastAddedId, open: cartOpen } = useCart();
  const { index } = useMenu();
  const addToCart = useAddToCart();
  const openProduct = useOpenProduct();
  const [visible, setVisible] = useState(false);
  const done = useRef(false);

  const rec = useMemo(() => (RULE ? recommendFor(lines.map((l) => l.productId), index, [RULE]) : null), [lines, index]);

  // Show once, a beat after the first savory add (the rule already skips carts with dessert).
  useEffect(() => {
    if (addTick === 0 || done.current || !rec || !lastAddedId) return;
    const added = index.get(lastAddedId);
    if (!added || !RULE?.when.categoryIds?.includes(added.categoryId)) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) {
        done.current = true;
        return;
      }
    } catch {
      /* no storage: still once per page view */
    }
    const t = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(t);
  }, [addTick, lastAddedId, rec, index]);

  const close = useCallback(() => {
    done.current = true;
    setVisible(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  // Something sweet went in → a thank-you beat, then away.
  const thanks = visible && !rec;
  useEffect(() => {
    if (!thanks) return;
    const t = window.setTimeout(close, 1500);
    return () => window.clearTimeout(t);
  }, [thanks, close]);

  const show = visible && !cartOpen;

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          aria-label={RULE?.title}
          initial={{ opacity: 0, y: 90, rotate: 12 }}
          animate={{ opacity: 1, y: 0, rotate: -1.5, transition: { type: "spring", stiffness: 130, damping: 14, mass: 0.7 } }}
          exit={{ opacity: 0, y: 60, rotate: 8, transition: { duration: 0.28, ease: [0.55, 0, 0.8, 0.3] } }}
          style={{ transformOrigin: "0% 100%" }}
          className="sticker fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 rounded-[1.6rem] bg-pistachio p-4 text-leaf-deep md:inset-x-auto md:bottom-6 md:left-6 md:w-[24rem]"
        >
          <button type="button" onClick={close} aria-label="لا شكرًا" className="absolute top-2 left-2 grid size-9 place-items-center rounded-full hover:bg-leaf-deep/10">
            <CloseIcon size={18} />
          </button>

          {thanks || !rec ? (
            <p className="font-display py-3 text-center text-2xl font-bold">كده الأكلة كملت.</p>
          ) : (
            <>
              <p className="font-display text-[1.9rem] leading-none font-bold">{RULE?.title}</p>
              {RULE?.line && <p className="mt-1 text-[13px] font-medium text-leaf-deep/80">{RULE.line}</p>}
              <ul className="mt-3 flex gap-2.5">
                {rec.products.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex min-w-0 flex-1 flex-col items-center text-center">
                    <button type="button" onClick={() => openProduct(p.id)} aria-label={`تفاصيل ${p.name}`} className="sticker relative block aspect-square w-full max-w-24 overflow-hidden rounded-full bg-cream">
                      {p.image ? (
                        <Image src={p.image.src} alt={p.image.alt} fill sizes="96px" className="object-cover" style={p.image.focus ? { objectPosition: p.image.focus } : undefined} />
                      ) : (
                        <span className="font-display grid h-full place-items-center px-2 text-[15px] leading-tight font-bold text-chili">{p.name}</span>
                      )}
                    </button>
                    <span className="mt-1.5 w-full truncate text-[13px] font-bold">{p.name}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[13px] tabular-nums">{formatPrice(startingPrice(p))}</span>
                      <button
                        type="button"
                        aria-label={`أضف ${p.name}`}
                        onClick={(e) => (needsConfiguration(p) ? openProduct(p.id) : addToCart({ productId: p.id }, e.currentTarget))}
                        className="grid size-7 place-items-center rounded-full bg-chili text-cream transition-transform duration-200 ease-snap active:scale-90"
                      >
                        <PlusIcon size={15} strokeWidth={3} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
