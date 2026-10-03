"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Product, Surface } from "@/types/menu";
import { useMotionMode } from "@/hooks/useMediaQuery";
import { cta } from "@/content/copy";
import { cn, formatNumber, formatPrice, itemsLabel } from "@/lib/format";
import { ORDER_EVENT, type OrderEventDetail } from "@/lib/order-nav";
import { startingPrice } from "@/lib/pricing";
import { getLenis } from "@/lib/smooth-scroll";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { useOpenProduct } from "@/store/product-sheet-context";
import { Logo } from "@/components/brand/Logo";
import { ChiliMark } from "@/components/brand/Chili";
import { BagIcon } from "@/components/ui/Icons";
import { FoodImage, surfaceClass } from "@/components/ui/FoodImage";
import { PriceFlag } from "@/components/ui/PriceFlag";
import { AddControl } from "@/components/menu/AddControl";
import { orderTotal } from "@/components/cart/CartSummary";

/**
 * THE ORDERING APP — the tablet's screen and the only menu on the site.
 *
 *  ┌ logo · category tabs (one category at a time) · cart ┐
 *  │  PREVIEW (right): the item you hover, big  │  LIST  │
 *  └───────────────────────── checkout ────────────────────┘
 *
 * Scrolling: once the tablet fills the screen (`live`), the wheel anywhere on
 * the screen scrolls the list only; the page continues after the list ends.
 */
export function OrderApp({ live }: { live: boolean }) {
  const { menu, productsByCategory, categoryById } = useMenu();
  const { count, subtotal, openCart, hydrated, addTick } = useCart();
  const openProduct = useOpenProduct();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(menu.categories[0]?.id ?? "");
  const [hover, setHover] = useState<string | null>(null);
  const [wipe, setWipe] = useState<{ key: number; label: string } | null>(null);
  const wipeTimer = useRef(0);
  const animate = useMotionMode() !== "off";
  const n = hydrated ? count : 0;
  const tab = live ? undefined : -1;

  const items = productsByCategory.get(active) ?? [];
  const surface: Surface = categoryById.get(active)?.surface ?? "orange";
  const preview = items.find((p) => p.id === hover) ?? items[0];

  const show = useCallback((id: string) => {
    setActive(id);
    setHover(null);
    listRef.current?.scrollTo({ top: 0 });
  }, []);

  /** Switching category: a red sweep with the category's name crosses the screen. */
  const switchTo = useCallback(
    (id: string) => {
      if (id === active) return;
      if (!animate) return show(id);
      setWipe({ key: Date.now(), label: menu.categories.find((c) => c.id === id)?.name ?? "" });
      window.clearTimeout(wipeTimer.current);
      wipeTimer.current = window.setTimeout(() => show(id), 290);
    },
    [active, animate, menu.categories, show],
  );
  useEffect(() => () => window.clearTimeout(wipeTimer.current), []);

  // «كل الحلويات» etc. from anywhere on the page.
  useEffect(() => {
    const onOrder = (e: Event) => {
      const id = (e as CustomEvent<OrderEventDetail>).detail?.categoryId;
      if (id) show(id);
    };
    window.addEventListener(ORDER_EVENT, onOrder);
    return () => window.removeEventListener(ORDER_EVENT, onOrder);
  }, [show]);

  // The wheel stays inside the tablet until the list is finished.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !live) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[role=dialog]")) return;
      const list = listRef.current;
      const lenis = getLenis();
      if (!list) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      const atTop = list.scrollTop <= 0;
      const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
      e.preventDefault();
      if ((dy > 0 && atEnd) || (dy < 0 && atTop)) {
        if (lenis) lenis.scrollTo(lenis.targetScroll + dy);
        else window.scrollBy(0, dy);
      } else {
        list.scrollTop += dy;
      }
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [live]);

  const { total } = orderTotal(subtotal, "delivery");

  return (
    <div ref={rootRef} data-lenis-prevent={live ? "" : undefined} className="flex h-full flex-col bg-cream">
      {/* ---------- top bar ---------- */}
      <div className="flex shrink-0 items-center gap-3 border-b border-coal/8 bg-cream px-3 py-2 md:gap-6 md:px-8 md:py-3">
        <Logo className="hidden w-28 md:block" alive={false} sizes="112px" />
        <nav aria-label="أقسام المنيو" className="min-w-0 flex-1">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto md:justify-center">
            {menu.categories.map((c) => {
              const on = c.id === active;
              return (
                <li key={c.id} className="shrink-0">
                  <button
                    type="button"
                    tabIndex={tab}
                    aria-current={on ? "true" : undefined}
                    onClick={() => switchTo(c.id)}
                    className={cn(
                      "font-display relative flex h-10 items-center rounded-full px-4 text-base font-extrabold transition-colors duration-200 md:text-lg",
                      on ? "text-cream" : "text-coal hover:bg-coal/6",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId="app-cat-pill"
                        transition={{ type: "spring", stiffness: 520, damping: 38 }}
                        className="absolute inset-0 rounded-full bg-chili"
                      />
                    )}
                    <span className="relative">{c.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          tabIndex={tab}
          data-cart-target=""
          key={`app-cart-${addTick}`}
          onClick={() => openCart("cart")}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 font-bold transition-colors",
            addTick > 0 && "animate-cart-hit",
            n > 0 ? "bg-chili text-cream" : "bg-coal/6 text-coal",
          )}
        >
          <BagIcon size={20} />
          <span className="tabular-nums">{formatNumber(n)}</span>
          {n > 0 && <span className="hidden tabular-nums md:inline">· {formatPrice(total)}</span>}
        </button>
      </div>

      {/* ---------- body ---------- */}
      <div className="relative flex min-h-0 flex-1">
        <AnimatePresence>
          {wipe && (
            <motion.div
              key={wipe.key}
              aria-hidden="true"
              initial={{ x: "105%" }}
              animate={{ x: ["105%", "0%", "0%", "-105%"] }}
              transition={{ duration: 0.75, times: [0, 0.38, 0.55, 1], ease: [0.7, 0, 0.3, 1] }}
              onAnimationComplete={() => setWipe(null)}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center gap-4 overflow-hidden bg-chili text-cream"
            >
              <ChiliMark className="h-[36%] w-auto rotate-[120deg]" body="var(--color-chili-deep)" stem="var(--color-leaf)" />
              <span className="font-display text-[clamp(3rem,11vw,8rem)] leading-none font-black">{wipe.label}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PREVIEW — right (desktop): whatever you hover */}
        <div className="hidden w-[54%] shrink-0 p-6 md:block lg:p-8">
          <div className={cn("relative h-full overflow-hidden rounded-panel", surfaceClass[surface])}>
            <AnimatePresence mode="popLayout" initial={false}>
              {preview && <Preview key={preview.id} product={preview} surface={surface} animate={animate} />}
            </AnimatePresence>
          </div>
        </div>

        {/* LIST — the active category only */}
        <div ref={listRef} className={cn("min-h-0 flex-1 px-3 pt-3 pb-28 md:ps-0 md:pe-6 md:pt-6 md:pb-8 lg:pe-8", live ? "overflow-y-auto overscroll-contain" : "overflow-hidden")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={animate ? { opacity: 0, y: 28 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={animate ? { opacity: 0, y: -12 } : undefined}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="mb-3 flex items-baseline justify-between gap-3 px-1">
                <h3 className="font-display text-3xl font-black md:text-4xl">{categoryById.get(active)?.name}</h3>
                <p className="text-sm font-bold text-smoke">
                  <span className="text-chili">{categoryById.get(active)?.craving}</span> · {itemsLabel(items.length)}
                </p>
              </header>
              <ul className="flex flex-col gap-2">
                {items.map((p) => (
                  <Row
                    key={p.id}
                    product={p}
                    surface={surface}
                    on={p.id === preview?.id}
                    tab={tab}
                    onHover={() => setHover(p.id)}
                    onOpen={() => openProduct(p.id)}
                  />
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ---------- checkout (desktop; phones use the global cart bar) ---------- */}
      {n > 0 && (
        <div className="hidden shrink-0 border-t border-coal/8 bg-white px-8 py-3 md:block">
          <button
            type="button"
            tabIndex={tab}
            onClick={() => openCart("cart")}
            className="ms-auto flex h-13 w-full max-w-md items-center justify-between rounded-full bg-chili px-6 text-lg font-bold text-cream shadow-cta"
          >
            <span>
              {cta.checkout} · {itemsLabel(n)}
            </span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function optionsLine(p: Product) {
  return p.options?.map((o) => `${o.name} ${formatPrice(o.price)}`).join(" · ");
}

function Preview({ product, surface, animate }: { product: Product; surface: Surface; animate: boolean }) {
  const light = surface !== "cream";
  const cutout = product.image?.cutout;
  return (
    <motion.div
      initial={animate ? { opacity: 0, x: 40, scale: 0.96 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={animate ? { opacity: 0, x: -30, scale: 0.98 } : undefined}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute inset-0 flex flex-col p-6 lg:p-8", light ? "text-cream" : "text-coal")}
    >
      <div className="relative min-h-0 flex-1">
        <FoodImage
          image={product.image}
          label={product.name}
          surface={product.image ? undefined : surface}
          sizes="(min-width: 768px) 46vw, 90vw"
          className={cn("absolute inset-0", !cutout && "overflow-hidden rounded-card shadow-pop")}
        />
        {product.badge && (
          <span className="absolute top-2 right-2 rounded-full bg-chili px-3 py-1 text-sm font-black text-cream shadow-cta">{product.badge}</span>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.1] font-black">{product.name}</p>
          {(product.tagline || product.description) && (
            <p className={cn("mt-1 text-[15px]", light ? "text-cream/85" : "text-smoke")}>{product.description ?? product.tagline}</p>
          )}
          {product.options && <p className={cn("mt-1 text-sm font-bold", light ? "text-cream/90" : "text-coal/70")}>{optionsLine(product)}</p>}
        </div>
        <div className="flex items-center gap-3">
          <PriceFlag value={startingPrice(product)} from={Boolean(product.options?.length)} size="lg" tone={light ? "cream" : "chili"} />
          <AddControl product={product} />
        </div>
      </div>
    </motion.div>
  );
}

function Row({
  product,
  surface,
  on,
  tab,
  onHover,
  onOpen,
}: {
  product: Product;
  surface: Surface;
  on: boolean;
  tab?: number;
  onHover: () => void;
  onOpen: () => void;
}) {
  return (
    <li
      onMouseEnter={onHover}
      onFocus={onHover}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl bg-white p-2 pe-3 shadow-card transition-[transform,box-shadow] duration-200 ease-snap",
        on && "md:-translate-x-1.5 md:shadow-pop md:ring-2 md:ring-chili",
      )}
    >
      <button type="button" tabIndex={tab} onClick={onOpen} aria-label={`تفاصيل ${product.name}`} className="absolute inset-0 rounded-2xl" />
      <span className={cn("pointer-events-none relative size-16 shrink-0 overflow-hidden rounded-xl md:size-[4.5rem]", surfaceClass[surface])}>
        <FoodImage
          image={product.image}
          label={product.name}
          surface={product.image ? undefined : surface}
          sizes="72px"
          grounded={false}
          className={cn("absolute", product.image?.cutout ? "inset-1" : "inset-0")}
        />
      </span>
      <span className="pointer-events-none relative min-w-0 flex-1">
        <span className="font-display block truncate text-lg leading-tight font-black md:text-xl">{product.name}</span>
        <span className="mt-0.5 block text-sm font-bold text-chili tabular-nums">
          {product.options?.length ? "من " : ""}
          {formatPrice(startingPrice(product))}
        </span>
      </span>
      <span className="relative">
        <AddControl product={product} variant="round" />
      </span>
    </li>
  );
}
