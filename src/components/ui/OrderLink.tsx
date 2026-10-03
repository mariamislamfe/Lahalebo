"use client";

import type { ComponentProps } from "react";
import { ORDER_ANCHOR, openOrder } from "@/lib/order-nav";

/** A link into the tablet's ordering app. Works as a plain anchor without JS. */
export function OrderLink({
  categoryId,
  onClick,
  ...rest
}: Omit<ComponentProps<"a">, "href"> & { categoryId?: string }) {
  return (
    <a
      href={`#${ORDER_ANCHOR}`}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        openOrder(categoryId);
      }}
      {...rest}
    />
  );
}
