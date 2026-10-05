"use client";

import Image from "next/image";
import { useMemo, useRef, type CSSProperties } from "react";
import type { Product } from "@/types/menu";
import { condimentStation, type CondimentSpot } from "@/data/condiments";
import { siteConfig } from "@/config/site";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cn, formatNumber, formatPrice } from "@/lib/format";
import { lineKey } from "@/lib/pricing";
import { requestEncoreWink } from "@/lib/wink";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";

/**
 * «زوّد براحتك» — the condiment counter.
 * Each condiment is a round dish — a plain coloured circle until its real photo
 * is added in data/menu.ts (then bottles show as tall bottles). One tap = one more
 * in your order: bottles tilt and pour, bowls get a scoop, the count snaps,
 * the cart catches it. The cart is the single source of truth for counts.
 * The very first add earns the pepper's one encore wink (lib/wink).
 */
export function CondimentStation() {
  const { index } = useMenu();
  const { lines, hydrated } = useCart();

  const spots = useMemo(
    () =>
      condimentStation
        .map((s) => ({ spot: s, product: index.get(s.productId) }))
        .filter((s): s is { spot: CondimentSpot; product: Product } => Boolean(s.product?.available)),
    [index],
  );

  const qty = (id: string) => (hydrated ? (lines.find((l) => l.key === simpleKey(id))?.qty ?? 0) : 0);
  const picked = spots.map((s) => ({ ...s, n: qty(s.product.id) })).filter((s) => s.n > 0);
  const total = picked.reduce((sum, s) => sum + (s.product.price ?? 0) * s.n, 0);

  if (spots.length === 0) return null;

  return (
    <section id="extras" aria-labelledby="extras-title" className="relative overflow-x-clip bg-cream pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="container-site">
        <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div data-reveal="">
            <h2 id="extras-title" className="leading-none">
              <span className="shout-sign block text-[clamp(5rem,19vw,11rem)] leading-[1.15] text-chili [--sign-shadow:var(--color-chili-ink)]">
                زوّد
              </span>
              <span className="font-display -mt-2 block text-[clamp(2.2rem,7vw,4.2rem)] font-bold text-coal md:-mt-3">براحتك.</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg text-smoke">
              شطة، دقة، صلصة وتقلية — كل حاجة بجنيهاتها. دوس على اللي نفسك فيه، وهو يروح على طلبك على طول.
            </p>
          </div>

          {/* the tally: what you reached for so far */}
          <div aria-live="polite" className="md:max-w-xs md:text-end">
            {picked.length > 0 ? (
              <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-leaf px-4 py-2.5 text-[15px] font-bold text-cream">
                <CheckIcon size={16} strokeWidth={3} />
                زوّدت: {picked.map((s) => `${formatNumber(s.n)} ${s.product.name}`).join(" · ")}
                <span className="tabular-nums opacity-80">({formatPrice(total)})</span>
              </p>
            ) : (
              <p className="font-display text-xl font-bold text-chili">الشطة مستنياك.</p>
            )}
          </div>
        </header>

        <ul className="mt-12 grid grid-cols-3 items-end gap-x-3 gap-y-10 sm:gap-x-6 md:mt-16 lg:grid-cols-6">
          {spots.map(({ spot, product }, i) => (
            <li key={product.id} data-reveal="" style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}>
              <Condiment spot={spot} product={product} n={qty(product.id)} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Condiments are simple products: no size, no extras — one stable cart line. */
function simpleKey(productId: string) {
  return lineKey({ productId, extraIds: [], choiceIds: [] });
}

function Condiment({ spot, product, n }: { spot: CondimentSpot; product: Product; n: number }) {
  const addToCart = useAddToCart();
  const { setQty } = useCart();
  const objectRef = useRef<HTMLSpanElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  // The tall bottle shape needs the real bottle photo; until then everything is a circle.
  const bottle = spot.vessel === "bottle" && Boolean(product.image);
  const on = n > 0;
  const open = siteConfig.ordering.open;

  function add() {
    addToCart({ productId: product.id }, objectRef.current, { quiet: true, color: spot.tint });
    react(objectRef.current, fxRef.current, spot);
    window.setTimeout(requestEncoreWink, 650);
  }

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={add}
        disabled={!open}
        aria-label={`زوّد ${product.name} — ${formatPrice(product.price)}${on ? `، في طلبك ${formatNumber(n)}` : ""}`}
        className="group relative flex w-full touch-manipulation justify-center outline-none disabled:opacity-50"
      >
        <span
          ref={objectRef}
          className={cn(
            "relative block transition-transform duration-200 ease-snap group-hover:-rotate-3 group-active:scale-[0.93]",
            bottle ? "w-[64%] origin-[50%_92%] sm:w-[52%]" : "w-[92%] origin-center sm:w-[84%]",
          )}
        >
          <span
            className={cn(
              "sticker relative block overflow-hidden bg-cream transition-[box-shadow] duration-300",
              bottle ? "aspect-[240/560] rounded-t-full rounded-b-[1.4rem]" : "aspect-square rounded-full",
              on && "outline-4 outline-leaf-bright",
            )}
          >
            {product.image ? (
              <Image src={product.image.src} alt={product.image.alt} fill sizes="(min-width: 1024px) 12rem, 30vw" className="object-cover" />
            ) : (
              // placeholder until the photo arrives: the condiment's own colour
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle at 38% 32%, color-mix(in srgb, ${spot.tint} 55%, white), ${spot.tint} 62%)` }}
              />
            )}
            {/* bowl depth: a soft inner rim */}
            {!bottle && <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-[inset_0_8px_18px_rgb(60_20_5/0.45)]" />}
          </span>

          {/* particles fly from here */}
          <span ref={fxRef} aria-hidden="true" className={cn("pointer-events-none absolute", bottle ? "top-[2%] left-1/2" : "top-[30%] left-1/2")} />

          {/* add affordance → count once added */}
          <span
            key={n}
            aria-hidden="true"
            className={cn(
              "absolute -bottom-2 left-[2%] grid h-10 min-w-10 place-items-center rounded-full px-1.5 text-[15px] font-bold text-cream ring-3 ring-cream",
              on ? "animate-bump bg-leaf" : "bg-chili transition-transform duration-200 ease-snap group-hover:scale-110",
            )}
          >
            {on ? formatNumber(n) : <PlusIcon size={20} strokeWidth={3} />}
          </span>
        </span>
      </button>

      <p className="font-display mt-4 text-[1.6rem] leading-none font-bold">{product.name}</p>
      <p className="mt-1 text-[13px] text-smoke">{spot.line}</p>
      <div className="mt-2 flex h-9 items-center gap-2">
        <span className="font-bold text-chili tabular-nums">{formatPrice(product.price)}</span>
        {on && (
          <button
            type="button"
            onClick={() => setQty(simpleKey(product.id), n - 1)}
            aria-label={`قلّل ${product.name}`}
            className="grid size-8 place-items-center rounded-full text-coal ring-1 ring-coal/20 transition-colors hover:bg-coal hover:text-cream"
          >
            <MinusIcon size={15} strokeWidth={2.6} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the physical reaction: pour / scoop + a few drops                    */
/* ------------------------------------------------------------------ */

function react(object: HTMLElement | null, fx: HTMLElement | null, spot: CondimentSpot) {
  if (!object || document.documentElement.dataset.motion === "off") return;
  const bottle = spot.vessel === "bottle";

  object.animate(
    bottle
      ? [
          // tilt to pour toward the plate, hold a beat, swing back past upright, settle
          { transform: "rotate(0deg)" },
          { transform: "rotate(-30deg) translateY(-6px)", offset: 0.32, easing: "ease-in-out" },
          { transform: "rotate(-26deg) translateY(-6px)", offset: 0.55, easing: "cubic-bezier(0.34,1.4,0.64,1)" },
          { transform: "rotate(4deg)", offset: 0.82 },
          { transform: "rotate(0deg)" },
        ]
      : [
          // a scoop: lift, dip toward you, settle
          { transform: "translateY(0) rotate(0deg) scale(1)" },
          { transform: "translateY(-16px) rotate(-9deg) scale(1.04)", offset: 0.3, easing: "ease-out" },
          { transform: "translateY(3px) rotate(5deg) scale(0.98)", offset: 0.62, easing: "ease-in-out" },
          { transform: "translateY(0) rotate(0deg) scale(1)" },
        ],
    { duration: bottle ? 720 : 560, easing: "cubic-bezier(0.22,1,0.36,1)" },
  );

  if (!fx) return;
  const count = bottle ? 4 : 5;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = bottle ? 7 + (i % 2) * 3 : 6 + (i % 3) * 3;
    Object.assign(p.style, {
      position: "absolute",
      left: `${-size / 2}px`,
      top: `${-size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: bottle ? "50% 50% 50% 50% / 60% 60% 40% 40%" : "40%",
      background: spot.tint,
      boxShadow: "inset -1px -1px 0 rgb(0 0 0 / 0.2)",
    });
    fx.appendChild(p);
    // drops leave the mouth of the tilted bottle and fall on a curve; crumbs hop out of the bowl
    const dx = bottle ? -46 - i * 12 : (i - 2) * 16;
    const up = bottle ? -10 - i * 4 : -46 - (i % 2) * 18;
    const fall = bottle ? 70 + i * 14 : 30;
    p.animate(
      [
        { transform: "translate(0,0) scale(0.4)", opacity: 0 },
        { transform: `translate(${dx * 0.5}px, ${up}px) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${fall}px) scale(0.7)`, opacity: 0 },
      ],
      { duration: 620, delay: (bottle ? 170 : 60) + i * 45, easing: "cubic-bezier(0.3,0.6,0.6,1)", fill: "both" },
    ).finished.finally(() => p.remove());
  }
}
