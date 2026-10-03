"use client";

import type { PricedLine } from "@/lib/pricing";
import { cn, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { FoodImage, surfaceClass } from "@/components/ui/FoodImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function CartItem({ line }: { line: PricedLine & { key: string } }) {
  const { setQty } = useCart();
  const { categoryById } = useMenu();
  const details = [line.optionName, ...line.extraNames, ...line.choiceNames].filter(Boolean).join(" · ");
  const surface = categoryById.get(line.product.categoryId)?.surface ?? "orange";

  return (
    <li className="flex gap-3 py-4">
      <div className={cn("relative size-20 shrink-0 overflow-hidden rounded-2xl", surfaceClass[surface])}>
        <FoodImage image={line.product.image} label={line.product.name} sizes="80px" className="absolute inset-1" grounded={false} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-xl leading-tight font-extrabold">{line.product.name}</p>
            {details && <p className="mt-0.5 text-[13px] font-medium text-chili">{details}</p>}
          </div>
          <p className="shrink-0 font-bold tabular-nums">{formatPrice(line.lineTotal)}</p>
        </div>
        <QuantityStepper value={line.qty} onChange={(q) => setQty(line.key, q)} removable size="sm" label={line.product.name} className="w-fit" />
      </div>
    </li>
  );
}
