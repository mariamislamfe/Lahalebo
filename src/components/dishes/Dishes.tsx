"use client";

import { useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion, useScroll } from "motion/react";
import type { Product } from "@/types/menu";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useMotionMode } from "@/hooks/useMediaQuery";
import { useProgress } from "@/hooks/useProgress";
import { cn, formatPrice } from "@/lib/format";
import { needsConfiguration, startingPrice } from "@/lib/pricing";
import { useMenu } from "@/store/menu-context";
import { useOpenProduct } from "@/store/product-sheet-context";
import { AddControl } from "@/components/menu/AddControl";
import { ChiliMark } from "@/components/brand/Chili";
import { FoodImage } from "@/components/ui/FoodImage";
import { OrderLink } from "@/components/ui/OrderLink";
import { PriceFlag } from "@/components/ui/PriceFlag";

/**
 * Food compositions around the tablet, built from the real photos and all
 * scrubbed to the scroll:
 *   <Signature/> — before the tablet: the signature plate + «لهاليبو» on fire;
 *                  its steam becomes the wall that hides the tablet.
 *   <Extras/>    — after the tablet: «طب نحلّيها؟» and the drinks list.
 */

/** 0 when the block's top enters the bottom of the screen → 1 when its bottom leaves the top. */
function usePass(ref: RefObject<HTMLElement | null>) {
  return useScroll({ target: ref, offset: ["start end", "end start"] }).scrollYProgress;
}

const STEAM = ["/fx/steam-puff-0.webp", "/fx/steam-puff-1.webp", "/fx/steam-column-2.webp", "/fx/steam-column-3.webp"];

/* ------------------------------------------------------------------ */
/* SIGNATURE                                                           */
/* ------------------------------------------------------------------ */

export function Signature() {
  const { productsByCategory } = useMenu();
  const koshary = (productsByCategory.get("koshary") ?? []).filter((p) => p.available);
  const product = koshary.find((p) => p.badge) ?? koshary[0];
  // The koshary tiers (عادي → جامبو) become one-tap buttons.
  const tiers = koshary.filter((k) => !k.options?.length);
  const loops = useMotionMode() === "full";
  const addToCart = useAddToCart();
  const openProduct = useOpenProduct();
  const ref = useRef<HTMLElement>(null);
  const p = usePass(ref);

  const plateX = useProgress(p, [0, 0.4], ["-22%", "0%"]);
  const plateRot = useProgress(p, [0, 0.4, 1], [-34, -6, 8]);
  const plateScale = useProgress(p, [0, 0.4, 1], [0.82, 1, 1.08]);
  const wordX = useProgress(p, [0, 0.42, 1], ["30%", "0%", "-5%"]);
  const wordScale = useProgress(p, [0, 0.42], [0.82, 1]);
  const badgeScale = useProgress(p, [0.1, 0.3, 0.36], [0, 1.15, 1]);
  const badgeRot = useProgress(p, [0.1, 0.36], [-20, -4]);
  const detailsY = useProgress(p, [0.12, 0.45], ["30%", "0%"]);
  const detailsOpacity = useProgress(p, [0.12, 0.36], [0, 1]);
  // steam off the plate — visible as soon as the section shows, thickening as you go
  const plumeY = useProgress(p, [0, 1], ["20%", "-60%"]);
  const plumeOpacity = useProgress(p, [0.02, 0.2, 1], [0.35, 0.9, 1]);
  const plumeScale = useProgress(p, [0, 1], [0.9, 1.5]);
  // …and becomes the wall at the bottom
  const wallY = useProgress(p, [0.4, 1], ["55%", "-15%"]);
  const wallOpacity = useProgress(p, [0.42, 0.9], [0, 1]);
  const wallScale = useProgress(p, [0.4, 1], [0.8, 1.6]);

  if (!product) return null;

  return (
    <section ref={ref} id="signature" aria-labelledby="signature-title" className="relative z-10 -mt-[18svh] overflow-hidden bg-orange text-cream [html[data-motion=off]_&]:mt-0">
      <div className="relative mx-auto h-[min(96svh,58rem)] min-h-[40rem] max-w-[110rem]">
        {/* the plate — with its steam */}
        <motion.div
          style={{ x: plateX, rotate: plateRot, scale: plateScale }}
          className="absolute top-[6%] left-[-4%] z-10 aspect-square w-[74%] will-change-transform md:top-[14%] md:left-[1%] md:w-[38%]"
        >
          <FoodImage image={product.image} label={product.name} sizes="(min-width: 768px) 38vw, 74vw" className="absolute inset-0" />
          <motion.div aria-hidden="true" style={{ y: plumeY, opacity: plumeOpacity, scale: plumeScale }} className="pointer-events-none absolute inset-x-[18%] -top-[26%] h-[58%]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn("absolute bottom-0 aspect-square w-[62%] bg-contain bg-center bg-no-repeat", loops ? "animate-steam-idle opacity-0" : "opacity-70")}
                style={
                  {
                    left: `${i * 20}%`,
                    backgroundImage: `url(${STEAM[2 + (i % 2)]})`,
                    animationDelay: `${i * 1.6}s`,
                    "--dur": `${5.4 + i * 0.6}s`,
                    "--drift": `${i % 2 ? -8 : 10}%`,
                    "--steam-max": 0.8,
                  } as CSSProperties
                }
              />
            ))}
          </motion.div>
        </motion.div>

        {/* right: one clean column — badge → «لهاليبو» on fire → line → sizes → link.
            The word reaches over to touch the plate's rim; nothing covers the text. */}
        <div className="absolute inset-x-4 bottom-6 z-20 flex flex-col items-start md:inset-x-auto md:top-1/2 md:right-[4%] md:bottom-auto md:w-[54%] md:-translate-y-1/2">
          {product.badge && (
          <motion.p
            style={{ scale: badgeScale, rotate: badgeRot }}
            className="mb-2 inline-flex origin-right items-center gap-2 rounded-full bg-chili py-1.5 ps-2 pe-4 text-base font-black text-cream shadow-cta md:text-lg"
          >
            <ChiliMark className="h-6 w-auto rotate-[110deg]" body="var(--color-cream)" stem="var(--color-leaf-bright)" />
            {product.badge}
          </motion.p>
          )}

          <motion.h2
            id="signature-title"
            style={{ x: wordX, scale: wordScale }}
            className={cn(
              "font-display text-sign origin-right text-[21vw] leading-[1.15] font-black whitespace-nowrap md:text-[clamp(4.5rem,12vw,12rem)]",
            )}
          >
            لهاليبو
          </motion.h2>

          <motion.div style={{ y: detailsY, opacity: detailsOpacity }} className="mt-2 w-full max-w-[34rem]">
            <p className="font-display text-xl font-bold text-cream md:text-2xl">
              {product.name}
              {product.tagline && <span className="font-sans text-lg font-normal text-cream/90"> — {product.tagline}</span>}
            </p>
            {tiers.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={(e) => (needsConfiguration(t) ? openProduct(t.id) : addToCart({ productId: t.id }, e.currentTarget))}
                    className={cn(
                      "flex flex-col items-center rounded-2xl px-2 py-2.5 shadow-cta transition-transform duration-200 ease-snap hover:-translate-y-1 active:scale-95",
                      t.id === product.id ? "bg-chili text-cream ring-2 ring-cream" : "bg-cream text-chili",
                    )}
                  >
                    <span className="font-display text-base leading-tight font-black md:text-lg">{t.name.replace(/^كشري\s*/, "")}</span>
                    <span className={cn("text-sm font-bold", t.id === product.id ? "text-cream/85" : "text-coal/70")}>{formatPrice(t.price)}</span>
                  </button>
                ))}
              </div>
            )}
            <OrderLink className="mt-4 inline-flex h-12 items-center rounded-full border-2 border-cream px-6 font-bold hover:bg-cream hover:text-chili">
              كل المنيو على التابلت ↓
            </OrderLink>
          </motion.div>
        </div>

        {/* the steam wall rising toward the tablet */}
        <motion.div aria-hidden="true" style={{ y: wallY, opacity: wallOpacity, scale: wallScale }} className="pointer-events-none absolute inset-x-[-10%] bottom-[-30%] z-40 h-[80%]">
          {STEAM.map((src, i) => (
            <span
              key={src}
              className="absolute bottom-0 aspect-square bg-contain bg-center bg-no-repeat"
              style={{ left: `${i * 26 - 6}%`, width: `${46 - (i % 2) * 8}%`, backgroundImage: `url(${src})` }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* EXTRAS — after the tablet                                           */
/* ------------------------------------------------------------------ */

export function Extras() {
  const { productsByCategory } = useMenu();
  const cat = (id: string) => (productsByCategory.get(id) ?? []).filter((p) => p.available);
  // Photographed sweet trays first, then the classic desserts.
  const desserts = [...cat("fateer-sweet"), ...cat("desserts")].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
  const drinks = cat("drinks");
  const withPhoto = desserts.filter((d) => d.image);
  const sweetLead = withPhoto.find((d) => d.featured) ?? desserts[0];
  if (!sweetLead && !drinks.length) return null;

  return (
    <section aria-label="حلو وساقع" className="relative overflow-hidden bg-cream pt-20 pb-24 md:pt-28 md:pb-32">
      {sweetLead && <SweetSide lead={sweetLead} others={(withPhoto.length >= 3 ? withPhoto : desserts).filter((d) => d !== sweetLead).slice(0, 2)} />}
      {drinks.length > 0 && <PrintedList title="حاجة ساقعة" items={drinks} />}
    </section>
  );
}

function DishLabel({ product }: { product: Product }) {
  const openProduct = useOpenProduct();
  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={() => openProduct(product.id)} className="text-start">
        <span className="font-display block text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.1] font-black text-coal">{product.name}</span>
        {product.tagline && <span className="mt-1 block text-[15px] text-smoke">{product.tagline}</span>}
      </button>
      <div className="flex items-center gap-3">
        <PriceFlag value={startingPrice(product)} from={Boolean(product.options?.length)} />
        <AddControl product={product} variant="round" />
      </div>
    </div>
  );
}

/* dessert floats up; the small ones orbit it (lighter, softer motion) */
/**
 * «طب نحلّيها؟» — three trays on a turntable. Hover (or tap) one and it slides
 * to the centre; its name, price and add button appear beside it.
 */
const SLOTS = [
  { x: "0%", y: "0%", scale: 1, rotate: 0, zIndex: 3, opacity: 1 }, // centre
  { x: "68%", y: "10%", scale: 0.55, rotate: 8, zIndex: 2, opacity: 0.92 }, // right
  { x: "-68%", y: "10%", scale: 0.55, rotate: -8, zIndex: 1, opacity: 0.92 }, // left
];

function SweetSide({ lead, others }: { lead: Product; others: Product[] }) {
  const trio = [lead, ...others].slice(0, 3);
  const [active, setActiveRaw] = useState(0);
  const still = useMotionMode() === "off";
  const current = trio[active];
  // While the trays are moving they pass under the cursor — ignore hovers until they settle.
  const lock = useRef(0);
  const setActive = (i: number, at: number) => {
    if (i === active || at < lock.current) return;
    lock.current = at + 550;
    setActiveRaw(i);
  };
  return (
    <div className="container-site">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_1.5fr] md:gap-8">
        <div>
          <p className="text-lg font-bold text-smoke">خلصت الحرّاق؟</p>
          <h2 className="font-display text-[clamp(3.4rem,9vw,7rem)] leading-[1.1] font-black text-leaf">طب نحلّيها؟</h2>
          <div className="mt-5 min-h-[9.5rem]">
            <motion.div
              key={current.id}
              initial={still ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DishLabel product={current} />
              {current.description && <p className="mt-3 max-w-sm text-[15px] text-smoke">{current.description}</p>}
            </motion.div>
          </div>
          {trio.length > 1 && (
            <div className="mt-6 flex gap-2" role="tablist" aria-label="اختار الحلو">
              {trio.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={(e) => {
                    lock.current = 0;
                    setActive(i, e.timeStamp);
                  }}
                  className="group/dot grid h-10 place-items-center px-1"
                  aria-label={t.name}
                >
                  <span className={cn("block h-2.5 rounded-full transition-all duration-300", i === active ? "w-10 bg-leaf" : "w-2.5 bg-coal/20 group-hover/dot:bg-coal/40")} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative order-first aspect-[5/4] md:order-none">
          {trio.map((t, i) => {
            const slot = SLOTS[(i - active + trio.length) % trio.length];
            const centre = i === active;
            return (
              <motion.button
                key={t.id}
                type="button"
                aria-label={t.name}
                onMouseEnter={(e) => setActive(i, e.timeStamp)}
                onMouseMove={(e) => setActive(i, e.timeStamp)}
                onFocus={(e) => setActive(i, e.timeStamp)}
                onClick={(e) => setActive(i, e.timeStamp)}
                initial={false}
                animate={slot}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 24, mass: 0.9 }}
                className={cn("absolute inset-[6%_20%] cursor-pointer md:inset-[10%_24%]", centre && "cursor-default")}
              >
                <FoodImage
                  image={t.image}
                  label={t.name}
                  surface={t.image ? undefined : "cream"}
                  sizes="(min-width: 768px) 46vw, 80vw"
                  className={cn("absolute inset-0", !t.image?.cutout && "overflow-hidden rounded-panel shadow-pop")}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* printed menu list — deliberately still */
function PrintedList({ title, items }: { title: string; items: Product[] }) {
  return (
    <div className="container-site mt-24 md:mt-32">
      <div className="mx-auto max-w-3xl rounded-panel bg-paper px-6 py-8 shadow-card md:px-12 md:py-12">
        <h2 className="font-display text-center text-4xl font-black text-leaf md:text-5xl">{title}</h2>
        <ul className="mt-8 space-y-4">
          {items.map((p) => (
            <li key={p.id} className="flex items-center gap-3">
              <span className="font-display text-2xl font-bold">{p.name}</span>
              <span aria-hidden="true" className="h-0 flex-1 translate-y-1 border-b-2 border-dotted border-coal/25" />
              <span className="font-display text-xl font-bold text-chili">{formatPrice(startingPrice(p))}</span>
              <AddControl product={p} variant="round" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
