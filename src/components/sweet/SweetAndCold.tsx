"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Product } from "@/types/menu";
import { useMotionMode } from "@/hooks/useMediaQuery";
import { cn, formatPrice } from "@/lib/format";
import { startingPrice } from "@/lib/pricing";
import { scrollToY } from "@/lib/smooth-scroll";
import { useMenu } from "@/store/menu-context";
import { useOpenProduct } from "@/store/product-sheet-context";
import { AddControl } from "@/components/menu/AddControl";
import { PriceFlag } from "@/components/ui/PriceFlag";

/**
 * «طب نحلّيها؟» → «حاجة ساقعة» — two full-screen pages side by side.
 *
 * The block pins while you scroll through it and the pages slide sideways:
 * the desserts move off to the right as the drinks come in from the left
 * (the next page in Arabic is on the left), each tipping slightly as it goes.
 * Scroll-linked, so scrolling back slides back. Motion "off": the pages stack.
 */
export function SweetAndCold() {
  const { productsByCategory } = useMenu();
  const still = useMotionMode() === "off";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const cat = (id: string) => (productsByCategory.get(id) ?? []).filter((x) => x.available);
  // Photographed sweet trays first, then the classic desserts.
  const sweets = [...cat("fateer-sweet"), ...cat("desserts")].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
  const drinks = cat("drinks");
  if (sweets.length === 0 && drinks.length === 0) return null;

  const dessert = sweets.length > 0 && <DessertPage sweets={sweets} />;
  const cold = drinks.length > 0 && <DrinksPage drinks={drinks} />;

  if (still || !dessert || !cold) {
    return (
      <section ref={ref} aria-label="حلو وساقع">
        {dessert && <div className="min-h-[calc(100svh-var(--nav-h))]">{dessert}</div>}
        {cold && <div className="min-h-[calc(100svh-var(--nav-h))]">{cold}</div>}
      </section>
    );
  }

  /** Jump to either side of the turn (also used when keyboard focus lands on the hidden page). */
  const goTo = (page: 0 | 1) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + (page === 0 ? 0 : travel), document.documentElement.dataset.motion !== "off");
  };

  return (
    <section ref={ref} aria-label="حلو وساقع" className="relative h-[260vh]">
      <div className="sticky top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))] overflow-hidden bg-leaf">
        <Turn p={p} onFocusDessert={() => p.get() > 0.5 && goTo(0)} onFocusDrinks={() => p.get() < 0.5 && goTo(1)} dessert={dessert} cold={cold} />
        <PageTabs p={p} onGo={goTo} />
      </div>
    </section>
  );
}

function Turn({
  p,
  dessert,
  cold,
  onFocusDessert,
  onFocusDrinks,
}: {
  p: MotionValue<number>;
  dessert: ReactNode;
  cold: ReactNode;
  onFocusDessert: () => void;
  onFocusDrinks: () => void;
}) {
  // 0–0.28 read the desserts · 0.28–0.72 slide sideways · 0.72–1 read the drinks
  const slide = useTransform(p, [0.28, 0.72], [0, 1], { clamp: true });
  // RTL: the drinks page waits on the left, so the strip moves right.
  const x = useTransform(slide, [0, 1], ["0%", "50%"]);
  // each page's content swings a little as it leaves / arrives (the house motion)
  const outRot = useTransform(slide, [0, 1], [0, 5]);
  const outY = useTransform(slide, [0, 1], ["0%", "6%"]);
  const inRot = useTransform(slide, [0, 1], [-5, 0]);
  const inY = useTransform(slide, [0, 1], ["6%", "0%"]);

  return (
    <motion.div style={{ x }} className="absolute inset-y-0 right-0 flex w-[200%]">
      <div className="relative h-full w-1/2 shrink-0" onFocusCapture={onFocusDessert}>
        <motion.div style={{ rotate: outRot, y: outY, transformOrigin: "100% 100%" }} className="h-full">
          {dessert}
        </motion.div>
      </div>
      <div className="relative h-full w-1/2 shrink-0" onFocusCapture={onFocusDrinks}>
        <motion.div style={{ rotate: inRot, y: inY, transformOrigin: "0% 100%" }} className="h-full">
          {cold}
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Which page you're on — and a way to jump to the other one. */
function PageTabs({ p, onGo }: { p: MotionValue<number>; onGo: (page: 0 | 1) => void }) {
  const fill = useTransform(p, [0.28, 0.72], ["0%", "100%"], { clamp: true });
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-coal/85 px-4 py-2 text-[13px] font-bold text-cream backdrop-blur">
        <button type="button" onClick={() => onGo(0)} className="hover:text-pistachio">
          نحلّيها
        </button>
        <span aria-hidden="true" className="relative h-1.5 w-16 overflow-hidden rounded-full bg-cream/20">
          <motion.span style={{ width: fill }} className="absolute inset-y-0 right-0 rounded-full bg-pistachio" />
        </span>
        <button type="button" onClick={() => onGo(1)} className="hover:text-pistachio">
          حاجة ساقعة
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 1 — «طب نحلّيها؟»: three trays on a turntable                    */
/* ------------------------------------------------------------------ */

// Centre, right, left (RTL: the next tray waits on the right).
const SLOTS = [
  { x: "0%", y: "0%", scale: 1, rotate: -2, zIndex: 3, opacity: 1 },
  { x: "62%", y: "8%", scale: 0.56, rotate: 9, zIndex: 2, opacity: 0.95 },
  { x: "-62%", y: "8%", scale: 0.56, rotate: -9, zIndex: 1, opacity: 0.95 },
];

function DessertPage({ sweets }: { sweets: Product[] }) {
  const withPhoto = sweets.filter((s) => s.image);
  const lead = withPhoto.find((s) => s.featured) ?? sweets[0];
  const trio = [lead, ...withPhoto.filter((s) => s !== lead)].slice(0, 3);
  const more = sweets.filter((s) => !trio.includes(s) && !s.image).slice(0, 4);
  const [active, setActiveRaw] = useState(0);
  const still = useMotionMode() === "off";
  const current = trio[active];
  // While the trays move they pass under the cursor — ignore hovers until they settle.
  const lock = useRef(0);
  const setActive = (i: number, at: number) => {
    if (i === active || at < lock.current) return;
    lock.current = at + 550;
    setActiveRaw(i);
  };

  return (
    <div className="relative flex h-full items-center overflow-hidden bg-pistachio text-leaf-deep">
      <p aria-hidden="true" className="font-shout pointer-events-none absolute bottom-[3%] left-[2%] text-[30vw] leading-[1.3] text-[#bcd58a] select-none lg:text-[15vw]">
        حلو
      </p>
      <div className="container-site relative grid w-full items-center gap-2 pb-12 lg:grid-cols-[1fr_1.35fr] lg:gap-10">
        <div>
          <p className="font-display text-lg font-bold opacity-80 md:text-2xl">خلصت الحرّاق؟</p>
          <h2 className="shout-sign text-[clamp(2.9rem,11vw,5.6rem)] leading-[1.35] whitespace-nowrap text-cream [--sign-shadow:var(--color-leaf)] [--sign-shadow-2:rgb(15_74_37/0.35)]">
            طب نحلّيها؟
          </h2>

          <div className="mt-2 min-h-[7.5rem] lg:mt-4 lg:min-h-[9rem]">
            <motion.div
              key={current.id}
              initial={still ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <DishLine product={current} />
              {current.description && <p className="mt-2 hidden max-w-sm text-[15px] opacity-80 md:block">{current.description}</p>}
            </motion.div>
          </div>

          {more.length > 0 && (
            <ul className="mt-3 hidden flex-wrap gap-2 sm:flex">
              {more.map((m) => (
                <li key={m.id}>
                  <MiniChip product={m} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative order-first aspect-[5/3.6] max-h-[42svh] w-full lg:order-none lg:aspect-[5/4] lg:max-h-[64svh]" role="group" aria-label="اختار الحلو">
          {trio.map((t, i) => {
            const slot = SLOTS[(i - active + trio.length) % trio.length];
            return (
              <motion.button
                key={t.id}
                type="button"
                aria-label={t.name}
                aria-pressed={i === active}
                onMouseEnter={(e) => setActive(i, e.timeStamp)}
                onFocus={(e) => setActive(i, e.timeStamp)}
                onClick={(e) => {
                  lock.current = 0;
                  setActive(i, e.timeStamp);
                }}
                initial={false}
                animate={slot}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 16, mass: 0.7 }}
                className="absolute inset-[4%_24%] cursor-pointer"
              >
                <SweetImage product={t} />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SweetImage({ product }: { product: Product }) {
  const img = product.image!;
  if (img.cutout) {
    return <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 34vw, 60vw" className="object-contain drop-shadow-[0_26px_24px_rgb(15_74_37/0.4)]" />;
  }
  return (
    <span className="sticker absolute inset-0 overflow-hidden rounded-[2rem] border-[5px]">
      <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 34vw, 60vw" className="object-cover" style={{ objectPosition: img.focus ?? "50% 80%" }} />
    </span>
  );
}

function DishLine({ product }: { product: Product }) {
  const open = useOpenProduct();
  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={() => open(product.id)} className="font-display text-start text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight font-bold text-coal hover:text-chili">
        {product.name}
      </button>
      <div className="flex items-center gap-3">
        <PriceFlag value={startingPrice(product)} from={Boolean(product.options?.length)} />
        <AddControl product={product} variant="round" />
      </div>
    </div>
  );
}

function MiniChip({ product }: { product: Product }) {
  const open = useOpenProduct();
  return (
    <button
      type="button"
      onClick={() => open(product.id)}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-cream/70 px-4 text-[14px] font-bold text-coal transition-transform duration-200 ease-snap hover:-rotate-2 hover:bg-cream"
    >
      {product.name}
      <span className="text-chili tabular-nums">{formatPrice(startingPrice(product))}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE 2 — «حاجة ساقعة»: the printed drinks list                         */
/* ------------------------------------------------------------------ */

function DrinksPage({ drinks }: { drinks: Product[] }) {
  return (
    <div className="relative flex h-full items-center overflow-hidden bg-leaf text-cream">
      <p aria-hidden="true" className="font-shout pointer-events-none absolute bottom-[3%] left-[2%] text-[26vw] leading-[1.3] text-[#1a6d35] select-none lg:text-[14vw]">
        ساقعة
      </p>
      <div className="container-site relative grid w-full items-center gap-6 pb-14 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
        <div>
          <p className="font-display text-lg font-bold text-pistachio md:text-2xl">والأكل ده كله…</p>
          <h2 className="shout-sign text-[clamp(2.9rem,11vw,5.6rem)] leading-[1.35] whitespace-nowrap text-cream [--sign-shadow:var(--color-leaf-deep)] [--sign-shadow-2:rgb(0_0_0/0.25)]">
            حاجة ساقعة
          </h2>
          <p className="mt-2 max-w-sm text-[15px] text-cream/80">تطفّي الحرّاق. ضيفها على طلبك بضغطة.</p>
        </div>

        <div className="sticker -rotate-1 rounded-[var(--radius-panel)] bg-cream px-5 py-6 text-coal md:px-10 md:py-9">
          <ul className="space-y-3 md:space-y-4">
            {drinks.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <span className="font-display text-xl font-bold md:text-2xl">{d.name}</span>
                <span aria-hidden="true" className="h-0 flex-1 translate-y-1 border-b-2 border-dotted border-coal/25" />
                <span className={cn("text-lg font-bold text-chili tabular-nums")}>{formatPrice(startingPrice(d))}</span>
                <AddControl product={d} variant="round" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
