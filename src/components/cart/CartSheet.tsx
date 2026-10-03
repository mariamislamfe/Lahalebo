"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { recommendationRules } from "@/data/recommendations";
import { cta, microcopy } from "@/content/copy";
import { formatNumber, formatPrice, itemsLabel } from "@/lib/format";
import type { OrderConfirmation } from "@/lib/order-schema";
import { recommendFor } from "@/lib/recommendations";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { ChiliMark } from "@/components/brand/Chili";
import { WinkingLogo } from "@/components/brand/WinkingLogo";
import { Button } from "@/components/ui/Button";
import { OrderLink } from "@/components/ui/OrderLink";
import { AlertIcon, ArrowBackIcon, CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { Sheet } from "@/components/ui/Sheet";
import { CartItem } from "./CartItem";
import { CartRecommendations } from "./CartRecommendations";
import { CartSummary, orderTotal } from "./CartSummary";
import { CheckoutForm } from "./CheckoutForm";

const TITLES = { cart: "طلبك", checkout: "بيانات الطلب", done: "الطلب وصل" } as const;

/** Drawer on desktop, bottom sheet on phones: cart → checkout → done. */
export function CartSheet() {
  const { open, view, closeCart, setView, clear } = useCart();
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const done = view === "done";

  return (
    <Sheet open={open} onClose={closeCart} label={TITLES[view]} variant="drawer" className={done ? "bg-orange" : "bg-cream"}>
      {!done && (
        <header className="flex items-center gap-2 bg-chili px-5 pt-7 pb-4 text-cream md:px-6 md:pt-5">
          {view === "checkout" && (
            <button type="button" onClick={() => setView("cart")} aria-label="ارجع للطلب" className="-ms-2 grid size-10 place-items-center rounded-full hover:bg-chili-deep">
              <ArrowBackIcon />
            </button>
          )}
          <h2 className="font-display text-[2rem] leading-none font-extrabold">{TITLES[view]}</h2>
          <button type="button" onClick={closeCart} aria-label="اقفل" className="ms-auto -me-2 grid size-10 place-items-center rounded-full hover:bg-chili-deep">
            <CloseIcon />
          </button>
        </header>
      )}

      {view === "cart" && <CartView onProceed={() => setView("checkout")} />}
      {view === "checkout" && (
        <CheckoutForm
          onSuccess={(o) => {
            setOrder(o);
            clear();
            setView("done");
          }}
        />
      )}
      {done && order && <OrderDone order={order} onClose={closeCart} />}
    </Sheet>
  );
}

function CartView({ onProceed }: { onProceed: () => void }) {
  const { lines, invalidLines, remove, count, subtotal, closeCart } = useCart();
  const { index } = useMenu();
  const recommendation = useMemo(() => recommendFor(lines.map((l) => l.productId), index, recommendationRules), [lines, index]);
  const { total } = orderTotal(subtotal, "delivery");

  if (lines.length === 0 && invalidLines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
        <ChiliMark className="mb-6 h-28 w-auto -rotate-[18deg]" />
        <p className="font-display text-[2.2rem] leading-tight font-extrabold">{microcopy.cartEmptyTitle}</p>
        <p className="mt-1 text-lg text-smoke">{microcopy.cartEmptyBody}</p>
        <OrderLink onClick={closeCart} className="mt-8 inline-flex h-12 items-center rounded-full bg-chili px-7 font-bold text-cream shadow-cta">
          {cta.browse}
        </OrderLink>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 md:px-6">
        <p className="pt-3 text-sm text-smoke">{itemsLabel(count)}</p>
        {invalidLines.length > 0 && (
          <div role="alert" className="mt-3 rounded-2xl bg-chili/8 p-3 text-sm text-chili-deep">
            <p className="flex items-center gap-2 font-bold">
              <AlertIcon size={16} />
              {formatNumber(invalidLines.length)} من اللي في الطلب بقى مش متاح
            </p>
            <button type="button" className="mt-2 font-bold underline underline-offset-4" onClick={() => invalidLines.forEach((l) => remove(l.key))}>
              شيلهم
            </button>
          </div>
        )}
        <ul className="divide-y divide-coal/8">
          {lines.map((l) => (
            <CartItem key={l.key} line={l} />
          ))}
        </ul>
        <CartRecommendations recommendation={recommendation} />
        <OrderLink onClick={closeCart} className="mb-4 inline-flex h-10 items-center text-[15px] font-bold text-leaf underline-offset-4 hover:underline">
          + ضيف حاجة كمان
        </OrderLink>
      </div>

      <footer className="pb-safe space-y-4 border-t border-coal/8 bg-white px-5 pt-4 md:px-6 md:pb-5">
        <CartSummary subtotal={subtotal} />
        {!siteConfig.ordering.open && <p className="text-sm font-bold text-chili">{microcopy.closed}</p>}
        <Button size="lg" className="w-full px-6" disabled={lines.length === 0 || !siteConfig.ordering.open} onClick={onProceed}>
          <span className="flex-1 text-start">{cta.checkout}</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </Button>
      </footer>
    </>
  );
}

function OrderDone({ order, onClose }: { order: OrderConfirmation; onClose: () => void }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-10 pb-6 text-cream md:px-7">
      <button type="button" onClick={onClose} aria-label="اقفل" className="absolute top-4 left-4 grid size-10 place-items-center rounded-full bg-black/15">
        <CloseIcon />
      </button>
      {/* The second (and last) place the pepper winks: your order is in. */}
      <WinkingLogo className="mx-auto mb-5 w-44 -rotate-6" sizes="176px" delay={450} />
      <p className="font-display text-center text-[3.2rem] leading-none font-extrabold">{microcopy.success}</p>
      <p className="mt-3 text-center text-cream/90">
        رقم طلبك{" "}
        <strong className="inline-block rounded-md bg-cream px-2 text-chili tabular-nums" dir="ltr">
          {order.orderId}
        </strong>
      </p>

      <ul className="mt-6 divide-y divide-coal/8 rounded-2xl bg-cream px-4 text-coal">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-3 py-3 text-[15px]">
            <span>
              <span className="text-smoke tabular-nums">{formatNumber(i.qty)}×</span> <strong>{i.name}</strong>
              {i.details && <span className="block text-[13px] text-chili">{i.details}</span>}
            </span>
            <span className="shrink-0 tabular-nums">{formatPrice(i.lineTotal)}</span>
          </li>
        ))}
        <li className="py-3">
          <CartSummary subtotal={{ total: order.subtotal, complete: true }} fulfillment={order.fulfillment} />
        </li>
      </ul>

      <Button size="lg" variant="inverse" className="mt-6 w-full" onClick={onClose}>
        <CheckIcon size={20} strokeWidth={2.6} />
        تمام
      </Button>
    </div>
  );
}
