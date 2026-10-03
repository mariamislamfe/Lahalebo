"use client";

import { AnimatePresence, motion } from "motion/react";
import { cta } from "@/content/copy";
import { formatNumber, formatPrice, itemsLabel } from "@/lib/format";
import { useCart } from "@/store/cart-context";
import { BagIcon } from "@/components/ui/Icons";

/** Phones: the order ticket peeking from the bottom, always in thumb reach. */
export function CartBar() {
  const { count, subtotal, open, openCart, addTick } = useCart();
  const visible = count > 0 && !open;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 pt-2 md:hidden"
        >
          <button
            type="button"
            onClick={() => openCart("cart")}
            className="flex h-16 w-full items-center gap-3 rounded-[1.4rem] ps-2 pe-5 text-cream shadow-[0_18px_40px_-12px_rgb(107_12_16/0.75)] bg-chili active:scale-[0.98]"
          >
            <span data-cart-target="" key={addTick} className="relative grid size-12 animate-bump place-items-center rounded-2xl bg-cream text-chili">
              <BagIcon size={22} />
              <span className="absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-[11px] font-bold text-cream">
                {formatNumber(count)}
              </span>
            </span>
            <span className="text-start leading-tight">
              <span className="block text-[17px] font-bold">{cta.checkout}</span>
              <span className="block text-[12px] text-cream/85">{itemsLabel(count)}</span>
            </span>
            {subtotal.complete && <span className="ms-auto text-[17px] font-bold tabular-nums">{formatPrice(subtotal.total)}</span>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
