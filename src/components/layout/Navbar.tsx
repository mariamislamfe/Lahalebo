"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cta, microcopy } from "@/content/copy";
import { cn, formatNumber, formatPhone, formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart-context";
import { WinkingLogo } from "@/components/brand/WinkingLogo";
import { FoodImage } from "@/components/ui/FoodImage";
import { useMenu } from "@/store/menu-context";
import { BagIcon, PhoneIcon } from "@/components/ui/Icons";
import { OrderLink } from "@/components/ui/OrderLink";

/** Quiet by design: logo, menu, hotline, cart. The food does the talking. */
export function Navbar() {
  const { count, subtotal, openCart, addTick, hydrated, lastAddedId } = useCart();
  const { index } = useMenu();
  const peek = lastAddedId ? index.get(lastAddedId) : undefined;
  const [scrolled, setScrolled] = useState(false);
  const { hotline } = siteConfig.contact;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasItems = hydrated && count > 0;

  return (
    <>
      {!siteConfig.ordering.open && (
        <div className="bg-coal px-4 py-2 text-center text-sm font-bold text-cream">{microcopy.closed}</div>
      )}
      <header
        className={cn(
          "sticky top-0 z-40 h-[var(--nav-h)] bg-cream transition-shadow duration-300 ease-calm",
          scrolled && "shadow-[0_2px_0_rgb(28_19_17/0.06),0_12px_30px_-20px_rgb(60_20_5/0.5)]",
        )}
      >
        <div className="container-site flex h-full items-center gap-3">
          <Link href="/" aria-label={`${siteConfig.name} — الرئيسية`} className="shrink-0">
            <WinkingLogo preload sizes="(min-width: 1024px) 140px, 112px" className="w-28 lg:w-36" delay={1400} />
          </Link>

          <nav aria-label="الرئيسية" className="ms-4 hidden md:block">
            <OrderLink className="rounded-full px-4 py-2 text-[15px] font-bold text-coal/80 hover:bg-coal/5 hover:text-coal">
              المنيو
            </OrderLink>
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <a
              href={`tel:${hotline}`}
              aria-label={`كلّمنا على ${hotline}`}
              className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-chili ring-1 ring-chili/25 transition-colors hover:bg-chili hover:text-cream"
            >
              <PhoneIcon size={18} />
              <span className="font-display hidden text-xl leading-none sm:inline">{formatPhone(hotline)}</span>
            </a>

            <span className="relative">
            <button
              key={`cart-${addTick}`}
              type="button"
              data-cart-target=""
              onClick={() => openCart("cart")}
              aria-label={hasItems ? `الطلب: ${formatNumber(count)}` : "الطلب فاضي"}
              className={cn(
                "relative inline-flex h-11 items-center gap-2 rounded-full transition-colors duration-200",
                addTick > 0 && "animate-cart-hit",
                hasItems ? "bg-coal ps-3 pe-4 text-cream hover:bg-coal-soft" : "w-11 justify-center text-coal ring-1 ring-coal/15 hover:bg-coal/5",
              )}
            >
              <span key={addTick} className={cn("relative", addTick > 0 && "animate-bump")}>
                <BagIcon size={21} />
                {hasItems && (
                  <span className="absolute -top-2 -left-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-chili px-1 text-[10px] font-bold text-cream">
                    {formatNumber(count)}
                  </span>
                )}
              </span>
              {hasItems && (
                <span className="hidden text-sm font-bold tabular-nums sm:inline">
                  {subtotal.complete ? formatPrice(subtotal.total) : "طلبك"}
                </span>
              )}
            </button>
            {addTick > 0 && peek && (
              <span
                key={`peek-${addTick}`}
                aria-hidden="true"
                className="animate-peek pointer-events-none absolute top-[calc(100%+8px)] left-1/2 -ml-7 grid size-14 place-items-center rounded-2xl bg-cream shadow-pop"
              >
                <FoodImage image={peek.image} label={peek.name} sizes="56px" className="absolute inset-1 overflow-hidden rounded-xl" grounded={false} surface={peek.image ? undefined : "orange"} />
              </span>
            )}
            </span>

            <OrderLink className="hidden h-11 items-center rounded-full bg-chili px-4 text-[15px] font-bold whitespace-nowrap text-cream shadow-cta transition-colors hover:bg-chili-deep min-[380px]:inline-flex md:px-5">
              {cta.order}
            </OrderLink>
          </div>
        </div>
      </header>
    </>
  );
}
