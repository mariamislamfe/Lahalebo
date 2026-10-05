"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Category, Product, Surface } from "@/types/menu";
import { cn, formatNumber, itemsLabel } from "@/lib/format";
import { ORDER_ANCHOR, ORDER_EVENT, type OrderEventDetail } from "@/lib/order-nav";
import { startingPrice } from "@/lib/pricing";
import { scrollToElement } from "@/lib/smooth-scroll";
import { useMenu } from "@/store/menu-context";
import { useOpenProduct } from "@/store/product-sheet-context";
import { AddControl } from "@/components/menu/AddControl";
import { ChiliMark } from "@/components/brand/Chili";
import { surfaceClass } from "@/components/ui/FoodImage";
import { ArrowBackIcon, ArrowForwardIcon } from "@/components/ui/Icons";
import { PriceFlag } from "@/components/ui/PriceFlag";

/**
 * «نفسك في إيه؟» — the whole menu. Comes right after the hero (via the chili storm).
 *
 * RAIL   (side) the categories, stacked. The chosen one becomes a cream sticker.
 * NAMES  (top) every dish of the chosen category in one row; the dish on show
 *        is lit up. Tap a name to jump to it.
 * DISHES one big dish at a time — photo, name, price, add. Swipe sideways on a
 *        phone, arrows on a laptop.
 * The room's colour follows the category (orange / red / cream / green).
 *
 * TRANSITIONS (the house swing — arcs around a pivot below):
 *   category → category  the old dishes swing out, the new ones swing in from
 *                        the direction you moved on the rail; names pop in one by one.
 *   dish → dish          scroll-linked: while you swipe, the cards fan on an arc
 *                        (tilted, smaller, dimmer away from the centre); the one
 *                        that lands straightens and its name/price rise in.
 */

const HEAT: Record<Surface, { bg: string; text: string }> = {
  orange: { bg: "#f26a1b", text: "text-cream" },
  red: { bg: "#d7201a", text: "text-cream" },
  cream: { bg: "#f4e3c6", text: "text-coal" },
  leaf: { bg: "#1e7b3c", text: "text-cream" },
};

const smooth = (): ScrollBehavior => (document.documentElement.dataset.motion === "off" ? "auto" : "smooth");

/** Scroll `row` sideways so `el` sits in its middle. Physical px, so it works the same in RTL. */
function centreIn(row: HTMLElement | null, el: HTMLElement | null) {
  if (!row || !el) return;
  const r = row.getBoundingClientRect();
  const e = el.getBoundingClientRect();
  row.scrollBy({ left: e.left + e.width / 2 - (r.left + r.width / 2), behavior: smooth() });
}

export function CravingMenu() {
  const { menu, productsByCategory, categoryById } = useMenu();
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const categories = useMemo(
    () =>
      menu.categories
        .filter((c) => c.available && productsByCategory.get(c.id)?.some((p) => p.available))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [menu.categories, productsByCategory],
  );

  const [catId, setCatIdRaw] = useState(categories[0]?.id);
  // +1 = moved down the rail (new dishes come up from below), -1 = moved up
  const [dir, setDir] = useState(1);
  const category = categoryById.get(catId ?? "") ?? categories[0];
  const heat = HEAT[category?.surface ?? "orange"];

  const setCatId = useCallback(
    (id: string) =>
      setCatIdRaw((cur) => {
        const a = categories.findIndex((c) => c.id === cur);
        const b = categories.findIndex((c) => c.id === id);
        if (a !== b) setDir(b > a ? 1 : -1);
        return id;
      }),
    [categories],
  );

  const select = useCallback((id: string) => {
    setCatId(id);
    // bring the dishes back into view if the visitor had scrolled past them
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0;
    if (sectionRef.current && top < -120) scrollToElement(sectionRef.current, document.documentElement.dataset.motion !== "off");
  }, [setCatId]);

  // Requests from the hero / navbar: open on a craving.
  useEffect(() => {
    const on = (e: Event) => {
      const detail = (e as CustomEvent<OrderEventDetail>).detail ?? {};
      if (detail.categoryId && categoryById.has(detail.categoryId)) setCatId(detail.categoryId);
    };
    window.addEventListener(ORDER_EVENT, on);
    return () => window.removeEventListener(ORDER_EVENT, on);
  }, [categoryById, setCatId]);

  function onRailKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const i = categories.findIndex((c) => c.id === category?.id);
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? categories.length - 1
          : e.key === "ArrowDown"
            ? (i + 1) % categories.length
            : (i - 1 + categories.length) % categories.length;
    select(categories[next].id);
    tabRefs.current[next]?.focus();
  }

  if (!category) return null;
  const products = (productsByCategory.get(category.id) ?? []).filter((p) => p.available);

  return (
    <section
      ref={sectionRef}
      id={ORDER_ANCHOR}
      aria-labelledby="menu-title"
      className={cn("relative overflow-x-clip transition-[background-color,color] duration-700 ease-calm", heat.text)}
      style={{ backgroundColor: heat.bg }}
    >
      <div className="container-site pt-14 pb-20 md:pt-20 md:pb-28">
        <h2 id="menu-title" data-reveal="" className="flex flex-wrap items-end gap-x-4 leading-none">
          <span className="font-display text-[clamp(1.6rem,4.5vw,2.6rem)] font-bold opacity-90 md:pb-6">نفسك في</span>
          <span className="shout-sign text-[clamp(4rem,13vw,7.5rem)] leading-[1.2] [--sign-shadow:rgb(92_10_12/0.55)] [--sign-shadow-2:transparent]">
            إيه؟
          </span>
        </h2>

        <div className="mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-5 lg:mt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          {/* ---------- RAIL (side) ---------- */}
          <div
            role="tablist"
            aria-label="الأصناف"
            aria-orientation="vertical"
            onKeyDown={onRailKey}
            className="no-scrollbar sticky top-[calc(var(--nav-h)+1rem)] flex max-h-[calc(100svh-var(--nav-h)-2rem)] flex-col gap-1.5 overflow-y-auto py-1 lg:gap-1"
          >
            {categories.map((c, i) => {
              const on = c.id === category.id;
              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={on}
                  aria-controls="menu-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(c.id)}
                  className={cn(
                    "w-full rounded-2xl px-2.5 py-2 text-start transition-[transform,background-color,color,opacity] duration-300 ease-snap sm:px-3 lg:w-fit lg:py-1",
                    on
                      ? "sticker -rotate-2 bg-cream text-chili lg:-translate-x-2"
                      : "bg-black/10 hover:bg-black/15 lg:bg-transparent lg:opacity-60 lg:hover:-translate-x-1 lg:hover:opacity-100",
                  )}
                >
                  <span className={cn("hidden text-[13px] font-bold whitespace-nowrap lg:block", on && "text-chili-deep")}>{c.craving}</span>
                  <span className="font-display block text-[15px] leading-tight font-bold sm:text-lg lg:text-[2rem] lg:leading-[1.25] lg:whitespace-nowrap">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---------- the chosen category ---------- */}
          <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${category.id}`} className="min-w-0">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={category.id}
                custom={dir}
                variants={CATEGORY_SWING}
                initial="enter"
                animate="center"
                exit="leave"
                style={{ transformOrigin: "50% 180%" }}
              >
                <DishCarousel category={category} products={products} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Category → category: swing out one way, swing in from the way you moved. */
const CATEGORY_SWING = {
  enter: (d: number) => ({ opacity: 0, y: 70 * d, rotate: -5 * d, scale: 0.95 }),
  center: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { type: "spring" as const, stiffness: 210, damping: 21, mass: 0.9 } },
  leave: (d: number) => ({ opacity: 0, y: -50 * d, rotate: 4 * d, scale: 0.97, transition: { duration: 0.2, ease: [0.55, 0, 0.8, 0.3] as const } }),
};

/* ------------------------------------------------------------------ */
/* the dishes: names on top, one big dish at a time                     */
/* ------------------------------------------------------------------ */

function DishCarousel({ category, products }: { category: Category; products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const nameRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // -1 until the first dish is seen, so it also gets its entrance
  const [active, setActive] = useState(-1);
  const shown = Math.max(0, active);

  // Whichever dish fills the track is the active one (swipe, arrows, names, keyboard).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { root: track, threshold: 0.6 },
    );
    slideRefs.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, [products]);

  // Dish → dish: while the track scrolls, fan the cards on an arc around a pivot
  // below them. Scroll-linked, transform/opacity only, one rAF per frame.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || document.documentElement.dataset.motion === "off") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = track.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      for (const s of slideRefs.current) {
        const card = s?.firstElementChild as HTMLElement | null;
        if (!s || !card) continue;
        const b = s.getBoundingClientRect();
        const d = Math.max(-1, Math.min(1, (b.left + b.width / 2 - cx) / b.width));
        const a = Math.abs(d);
        card.style.transform = `translateY(${(a * 26).toFixed(1)}px) rotate(${(d * 7).toFixed(2)}deg) scale(${(1 - a * 0.08).toFixed(3)})`;
        card.style.opacity = (1 - a * 0.45).toFixed(3);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [products]);

  // Keep the lit-up name in view in the names row (sideways only — never moves the page).
  useEffect(() => centreIn(namesRef.current, nameRefs.current[shown]), [shown]);

  const goTo = (i: number) => {
    const n = Math.max(0, Math.min(products.length - 1, i));
    centreIn(trackRef.current, slideRefs.current[n]);
  };

  function onTrackKey(e: KeyboardEvent<HTMLDivElement>) {
    // RTL: left = next dish, right = previous dish
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(shown + 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(shown - 1);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="font-display text-[clamp(1.3rem,3vw,2.2rem)] leading-tight font-bold">{category.craving}</p>
        <p className="shrink-0 text-[13px] font-bold opacity-80 tabular-nums sm:text-sm">
          {formatNumber(shown + 1)} / {formatNumber(products.length)}
          <span className="hidden sm:inline"> · {itemsLabel(products.length)}</span>
        </p>
      </div>

      {/* NAMES (top): the dish on show is lit up */}
      <motion.div
        ref={namesRef}
        aria-label={`أصناف ${category.name}`}
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } } }}
        className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-2"
      >
        {products.map((p, i) => (
          <motion.button
            key={p.id}
            variants={{
              hidden: { opacity: 0, y: 14, rotate: -6 },
              shown: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 420, damping: 24 } },
            }}
            ref={(el) => {
              nameRefs.current[i] = el;
            }}
            type="button"
            aria-current={i === active}
            onClick={() => goTo(i)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[14px] font-bold whitespace-nowrap transition-[transform,background-color,color,opacity] duration-300 ease-snap sm:text-[15px]",
              i === active ? "sticker -rotate-2 bg-cream text-chili" : "bg-black/10 opacity-80 hover:bg-black/15 hover:opacity-100",
            )}
          >
            {p.name}
          </motion.button>
        ))}
      </motion.div>

      {/* DISHES: swipe on a phone, arrows on a laptop */}
      <div className="relative mt-2">
        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={onTrackKey}
          aria-label="قلّب في الأصناف"
          className="no-scrollbar -my-8 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain py-8 outline-none focus-visible:outline-3 focus-visible:outline-leaf-bright md:gap-5"
        >
          {products.map((p, i) => (
            <article
              key={p.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              data-i={i}
              aria-label={p.name}
              className="w-[90%] shrink-0 snap-center md:w-full"
            >
              <DishSlide product={p} surface={category.surface} active={i === active} />
            </article>
          ))}
        </div>

        {products.length > 1 && (
          <>
            <ArrowButton side="right" label="الصنف اللي قبله" disabled={shown === 0} onClick={() => goTo(shown - 1)}>
              <ArrowBackIcon size={22} strokeWidth={2.6} />
            </ArrowButton>
            <ArrowButton side="left" label="الصنف اللي بعده" disabled={shown === products.length - 1} onClick={() => goTo(shown + 1)}>
              <ArrowForwardIcon size={22} strokeWidth={2.6} />
            </ArrowButton>
          </>
        )}
      </div>
    </div>
  );
}

function ArrowButton({
  side,
  label,
  disabled,
  onClick,
  children,
}: {
  side: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "sticker absolute top-1/2 z-10 hidden size-13 -translate-y-1/2 place-items-center rounded-full bg-coal text-cream transition-[scale,opacity] duration-200 ease-snap hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-0 md:grid",
        side === "left" ? "-left-5" : "-right-5",
      )}
    >
      {children}
    </button>
  );
}

function DishSlide({ product, surface, active }: { product: Product; surface: Surface; active: boolean }) {
  const open = useOpenProduct();
  const img = product.image;
  const sizes = product.options?.filter((o) => o.available !== false && o.price !== null);

  return (
    <div className="grid h-full origin-[50%_140%] gap-3 rounded-[1.75rem] bg-cream p-3 text-coal shadow-pop will-change-transform md:p-4 lg:grid-cols-[1fr_1.15fr] lg:gap-6 lg:p-5">
      {/* info: right on a laptop, under the photo on a phone — rises in when the dish lands */}
      <div className="flex flex-col justify-center px-1 pb-1 lg:px-3">
        <Rise on={active} step={0} className="flex flex-wrap items-center gap-2">
          {product.badge && <span className="rounded-full bg-chili px-2.5 py-0.5 text-[12px] font-bold text-cream">{product.badge}</span>}
          {product.tagline && <span className="text-[14px] font-bold text-chili">{product.tagline}</span>}
        </Rise>
        <Rise on={active} step={1}>
          <button
            type="button"
            onClick={() => open(product.id)}
            className="font-display mt-1 text-start text-[clamp(1.4rem,3.4vw,2.6rem)] leading-tight font-bold hover:text-chili"
          >
            {product.name}
          </button>
        </Rise>
        {product.description && (
          <Rise on={active} step={2}>
            <p className="mt-2 text-[14px] text-smoke lg:text-[15px]">{product.description}</p>
          </Rise>
        )}
        {sizes && sizes.length > 1 && (
          <Rise on={active} step={2} as="ul" className="mt-3 flex flex-wrap gap-1.5">
            {sizes.map((o) => (
              <li key={o.id} className="rounded-full bg-paper px-3 py-1 text-[13px] font-bold ring-1 ring-coal/10 tabular-nums">
                {o.name} <span className="text-chili">{formatNumber(o.price!)}</span>
              </li>
            ))}
          </Rise>
        )}
        <Rise on={active} step={3} className="mt-4 flex flex-wrap items-center gap-3 lg:mt-6">
          <PriceFlag value={startingPrice(product)} from={Boolean(sizes && sizes.length > 1)} size="lg" />
          <AddControl product={product} />
        </Rise>
      </div>

      {/* photo: left on a laptop, on top on a phone — swings into place when it arrives */}
      <button
        type="button"
        onClick={() => open(product.id)}
        aria-label={`تفاصيل ${product.name}`}
        className={cn(
          "relative order-first aspect-[4/3] overflow-hidden rounded-[1.25rem] lg:order-none lg:aspect-auto lg:min-h-[22rem]",
          (!img || img.cutout) && surfaceClass[surface],
        )}
      >
        <span className={cn("absolute inset-0 block transition-[scale] duration-700 ease-food", active ? "scale-100" : "scale-[1.08]")}>
          {img ? (
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 34rem, 80vw"
              className={img.cutout ? "object-contain p-4 drop-shadow-[0_22px_20px_rgb(60_20_5/0.4)]" : "object-cover"}
              style={img.focus ? { objectPosition: img.focus } : undefined}
            />
          ) : (
            <NamePlate name={product.name} />
          )}
        </span>
      </button>
    </div>
  );
}

/** Info lines rise in one after another when their dish lands in the centre. */
function Rise({
  on,
  step,
  as: Tag = "div",
  className,
  children,
}: {
  on: boolean;
  step: number;
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cn("transition-[opacity,translate] duration-500 ease-food", on ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", className)}
      style={{ transitionDelay: on ? `${120 + step * 70}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

/** No photo yet: a typographic plate with the dish's name — never a borrowed picture. */
function NamePlate({ name }: { name: string }) {
  return (
    <span className="absolute top-1/2 left-1/2 grid aspect-square h-[82%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream shadow-object">
      <span className="absolute inset-[5%] rounded-full border-[0.6rem] border-chili/90" />
      <span className="absolute inset-[13%] rounded-full border-2 border-dashed border-chili/30" />
      <ChiliMark className="absolute right-[8%] bottom-[6%] h-[28%] w-auto rotate-[24deg]" />
      <span className="font-display relative px-[20%] text-center text-[clamp(1rem,2.6vw,1.9rem)] leading-tight font-bold text-chili">{name}</span>
    </span>
  );
}
