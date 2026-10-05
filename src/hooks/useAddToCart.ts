"use client";

import { useCallback } from "react";
import { pickAddedLine } from "@/content/copy";
import { flyToCart } from "@/lib/fly-to-cart";
import type { LineInput } from "@/lib/pricing";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { useToast } from "@/store/toast-context";

type AddInput = Omit<LineInput, "extraIds" | "choiceIds" | "qty"> &
  Partial<Pick<LineInput, "extraIds" | "choiceIds" | "qty">>;

/**
 * Adds a line with all the feedback in one place: flight to the cart, bump, toast.
 * `quiet` skips the toast for places that are their own feedback (the condiment counter);
 * `color` is what flies to the cart when the product has no photo yet.
 */
export function useAddToCart() {
  const { add, addTick, open: cartOpen } = useCart();
  const { index } = useMenu();
  const toast = useToast();

  return useCallback(
    (input: AddInput, from?: HTMLElement | null, opts: { quiet?: boolean; color?: string } = {}) => {
      const line: LineInput = { extraIds: [], choiceIds: [], qty: 1, ...input };
      const product = index.get(line.productId);
      flyToCart(product?.image, from, opts.color);
      add(line);
      // Inside the open cart the list itself is the feedback.
      if (!cartOpen && !opts.quiet) toast({ title: `${product?.name ?? ""} في السلة`, body: pickAddedLine(addTick) });
    },
    [add, addTick, cartOpen, index, toast],
  );
}
