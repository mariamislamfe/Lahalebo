"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Product } from "@/types/menu";
import { siteConfig } from "@/config/site";
import { cta } from "@/content/copy";
import { useMediaQuery, useMotionMode } from "@/hooks/useMediaQuery";
import { useProgress } from "@/hooks/useProgress";
import { cn, formatPhone } from "@/lib/format";
import { startingPrice } from "@/lib/pricing";
import { ChiliMark } from "@/components/brand/Chili";
import { FoodImage } from "@/components/ui/FoodImage";
import { ArrowForwardIcon, PhoneIcon } from "@/components/ui/Icons";
import { OrderLink } from "@/components/ui/OrderLink";
import { PriceFlag } from "@/components/ui/PriceFlag";

/**
 * HERO — two acts.
 *
 * ACT 1 (load, pure CSS so it starts at first paint):
 *   the koshary whooshes in from the right → impact (jolt, steam) → settles;
 *   «جعان؟ / لهاليبو بيناديك.» rises, CTA + price snap on.
 *
 * ACT 2 (scroll, pinned, scrubbed — smooth via Lenis):
 *   0.00–0.30  the words split apart, the camera plunges into the bowl, heat turns the room red
 *   0.28–0.85  CHILI STORM — rows of chilies sweep across in alternating directions until
 *              they fill the screen; «زوّد شطة.» rides inside the storm
 *   0.85–1.00  the storm clears back to orange — the signature section starts on that same
 *              orange, so there is no seam
 */

const STEAM = ["/fx/steam-column-2.webp", "/fx/steam-column-3.webp", "/fx/steam-puff-0.webp"];
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

export function Hero({ koshary }: { koshary: Product }) {
  const mode = useMotionMode();
  const pinned = mode !== "off";
  const loops = mode === "full";
  const desktop = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // room temperature
  const bg = useProgress(p, [0, 0.28, 0.5, 0.86, 0.98], ["#f26a1b", "#c21c10", "#8e0f0c", "#8e0f0c", "#f26a1b"]);
  const glow = useProgress(p, [0, 0.3], [1, 1.9]);
  const glowOpacity = useProgress(p, [0, 0.3, 0.6], [0.7, 1, 0]);
  // the plunge
  const bowlScale = useProgress(p, [0, 0.42], [1, desktop ? 2.5 : 2]);
  const bowlX = useProgress(p, [0, 0.38], ["0%", desktop ? "36%" : "0%"]);
  const bowlY = useProgress(p, [0, 0.42], ["0%", desktop ? "10%" : "4%"]);
  const bowlRot = useProgress(p, [0, 0.42], [0, 16]);
  const bowlOpacity = useProgress(p, [0.46, 0.58], [1, 0]);
  // the words split
  const w1x = useProgress(p, [0, 0.22], ["0%", "70%"]);
  const w2x = useProgress(p, [0.02, 0.24], ["0%", "-80%"]);
  const wordsOpacity = useProgress(p, [0.1, 0.22], [1, 0]);
  const ctaY = useProgress(p, [0, 0.12], ["0%", "60%"]);
  const ctaOpacity = useProgress(p, [0, 0.1], [1, 0]);
  const ctaPointer = useTransform(ctaOpacity, (o) => (o < 0.5 ? "none" : "auto"));

  const price = startingPrice(koshary);
  const from = true; // the hero shows the cheapest koshary
  const { hotline } = siteConfig.contact;

  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className={cn("relative", pinned ? "h-[290vh] md:h-[310vh]" : "")}>
      <motion.div
        style={pinned ? { backgroundColor: bg } : undefined}
        className="sticky top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))] min-h-[36rem] overflow-hidden bg-orange text-cream"
      >
        <motion.div aria-hidden="true" style={{ scale: glow, opacity: glowOpacity }} className="heat-light absolute top-[-10%] left-[-25%] size-[110vw] md:top-[-18%] md:left-[-10%] md:size-[72vw]" />

        {/* ---------- the koshary ---------- */}
        <div className="hero-jolt absolute inset-0">
          <div className="absolute top-[2%] left-[-8%] h-[56%] w-[104%] md:top-[6%] md:bottom-[2%] md:left-[1%] md:h-auto md:w-[52%]">
            <motion.div style={{ scale: bowlScale, x: bowlX, y: bowlY, rotate: bowlRot, opacity: bowlOpacity }} className="absolute inset-0 will-change-transform">
              <div className="hero-bowl absolute inset-0">
                <FoodImage image={koshary.image} label={koshary.name} preload sizes="(min-width: 768px) 52vw, 104vw" className="absolute inset-0" />

                <div aria-hidden="true" className="pointer-events-none absolute top-[30%] left-[86%] w-[50%]">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="hero-speed block h-2.5 rounded-full bg-cream/80"
                      style={v({ "--d": `${0.1 + i * 0.03}s`, marginTop: i ? `${14 + i * 6}px` : 0, width: `${90 - i * 18}%`, marginLeft: `${i * 8}%` })}
                    />
                  ))}
                </div>

                {STEAM.map((src, i) => (
                  <span
                    key={src}
                    aria-hidden="true"
                    className="hero-burst pointer-events-none absolute -top-[8%] aspect-square w-[46%] bg-contain bg-center bg-no-repeat"
                    style={v({ "--d": `${0.6 + i * 0.05}s`, left: `${14 + i * 18}%`, backgroundImage: `url(${src})` })}
                  />
                ))}

                {loops && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-[26%] -top-[14%] h-[38%]">
                    {[
                      { l: "0%", d: "1.4s", dur: "5.6s", drift: "10%", t: STEAM[0] },
                      { l: "30%", d: "3.2s", dur: "6.4s", drift: "-8%", t: STEAM[1] },
                      { l: "14%", d: "5s", dur: "6s", drift: "6%", t: STEAM[0] },
                    ].map((s, i) => (
                      <span
                        key={i}
                        className="animate-steam-idle absolute bottom-0 aspect-square w-[70%] bg-contain bg-center bg-no-repeat opacity-0"
                        style={v({ left: s.l, backgroundImage: `url(${s.t})`, animationDelay: s.d, "--dur": s.dur, "--drift": s.drift })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ---------- the words ---------- */}
        <div className="absolute inset-x-4 bottom-4 z-10 md:inset-x-auto md:top-1/2 md:right-[4%] md:bottom-auto md:w-[46%] md:-translate-y-1/2">
          <motion.div style={{ opacity: wordsOpacity }}>
            <p className="hero-slide mb-3 inline-flex items-center gap-2 rounded-full bg-chili-deep/40 py-1 ps-2 pe-4 text-sm font-bold" style={v({ "--d": "0.5s" })}>
              <ChiliMark className="h-6 w-auto rotate-[110deg]" />
              لهاليبو كشري
            </p>
            <h1 id="hero-title" className="font-display leading-[1.05] font-black [text-shadow:0_6px_0_rgb(168_19_26/0.25)]">
              <motion.span style={{ x: w1x }} className="block overflow-hidden pb-[0.08em]">
                <span className="hero-rise block text-[clamp(4.4rem,18vw,10rem)]" style={v({ "--d": "0.55s" })}>
                  جعان؟
                </span>
              </motion.span>
              <motion.span style={{ x: w2x }} className="block overflow-hidden pb-[0.1em]">
                <span className="hero-rise block text-[clamp(2.1rem,7.8vw,4.3rem)] whitespace-nowrap text-chili-ink" style={v({ "--d": "0.68s" })}>
                  لهاليبو بيناديك.
                </span>
              </motion.span>
            </h1>
          </motion.div>

          <motion.div style={{ y: ctaY, opacity: ctaOpacity, pointerEvents: ctaPointer }}>
            <p className="hero-slide mt-3 hidden max-w-md text-lg text-cream/95 md:block" style={v({ "--d": "0.82s" })}>
              سخن، تقيل، وحرّاق على مزاجك — اطلبه من هنا في كام ضغطة.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-7">
              <span className="hero-pop flex-1 md:flex-none" style={v({ "--d": "0.88s" })}>
                <OrderLink className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-cream ps-6 pe-2 text-lg font-bold text-chili shadow-cta transition-transform duration-200 ease-snap active:scale-95 md:h-15 md:w-auto md:text-xl">
                  {cta.order}
                  <span className="grid size-10 place-items-center rounded-full bg-chili text-cream transition-transform duration-200 ease-snap group-hover:-translate-x-1">
                    <ArrowForwardIcon size={20} strokeWidth={2.6} />
                  </span>
                </OrderLink>
              </span>
              <span className="hero-pop hidden md:inline-flex" style={v({ "--d": "0.94s" })}>
                <OrderLink className="inline-flex h-15 items-center rounded-full border-2 border-cream/80 px-6 text-xl font-bold text-cream transition-colors hover:bg-cream hover:text-chili">
                  {cta.browse}
                </OrderLink>
              </span>
              <span className="hero-pop" style={v({ "--d": "1s", "--pr": "-18deg" })}>
                <PriceFlag value={price} from={from} size="lg" tone="cream" />
              </span>
            </div>
            <a href={`tel:${hotline}`} className="mt-6 hidden items-center gap-2 text-sm font-bold text-cream/85 hover:text-cream md:inline-flex">
              <PhoneIcon size={16} />
              أو كلّمنا {formatPhone(hotline)}
            </a>
          </motion.div>
        </div>

        {/* ---------- ACT 2: the chili storm ---------- */}
        {pinned && <ChiliStorm p={p} />}

      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* CHILI STORM                                                          */
/* ------------------------------------------------------------------ */

type Chili = { w: number; r: number; tone: "red" | "deep" | "green"; gap: number; dy: number };

// Deterministic rows (SSR-safe). Widths in vw — scaled ×--k on phones.
const ROWS: Chili[][] = Array.from({ length: 6 }, (_, row) =>
  Array.from({ length: 16 }, (_, i) => {
    const s = (row * 16 + i) * 9301 + 49297;
    const rnd = (n: number) => ((s * (n + 7)) % 233280) / 233280;
    const toneRoll = rnd(3);
    return {
      w: 9 + Math.round(rnd(1) * 9),
      r: Math.round(rnd(2) * 360),
      tone: toneRoll > 0.82 ? "green" : toneRoll > 0.55 ? "deep" : "red",
      gap: Math.round(rnd(4) * 1.5),
      dy: Math.round((rnd(5) - 0.5) * 30),
    };
  }),
);

const TONES = {
  red: { body: "var(--color-chili)", stem: "var(--color-leaf)" },
  deep: { body: "var(--color-chili-deep)", stem: "var(--color-leaf-deep)" },
  green: { body: "var(--color-leaf-bright)", stem: "var(--color-leaf-deep)" },
};

function ChiliStorm({ p }: { p: MotionValue<number> }) {
  const wordScale = useProgress(p, [0.44, 0.56], [0.55, 1]);
  const wordOpacity = useProgress(p, [0.44, 0.5, 0.76, 0.86], [0, 1, 1, 0]);
  const wordRot = useProgress(p, [0.44, 0.86], [-8, 4]);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 overflow-hidden [--k:1.9] md:[--k:1]">
      <div className="absolute inset-[-15%] -rotate-[9deg]">
        {ROWS.map((row, i) => (
          <StormRow key={i} p={p} row={row} index={i} />
        ))}
      </div>
      <motion.p
        style={{ scale: wordScale, opacity: wordOpacity, rotate: wordRot }}
        className="font-display absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(4rem,15vw,13rem)] leading-none font-black whitespace-nowrap text-cream [text-shadow:0_10px_0_rgb(92_10_12/0.5)]"
      >
        زوّد شطة.
      </motion.p>
    </div>
  );
}

function StormRow({ p, row, index }: { p: MotionValue<number>; row: Chili[]; index: number }) {
  const start = 0.28 + index * 0.025;
  // the storm runs to the very end of the pinned hero — no empty tail
  const end = 0.99 - (5 - index) * 0.012;
  const rtl = index % 2 === 0;
  const x = useProgress(p, [start, end], rtl ? ["105vw", "-230vw"] : ["-230vw", "105vw"]);
  const opacity = useProgress(p, [start, start + 0.02, end - 0.02, end], [0, 1, 1, 0]);
  return (
    <motion.div
      style={{ x, opacity, top: `${index * 19 - 4}%` }}
      className="absolute flex h-[30%] w-max items-center will-change-transform"
    >
      {row.map((c, i) => (
        <span
          key={i}
          className="inline-block shrink-0"
          style={{
            width: `calc(var(--k) * ${c.w}vw)`,
            marginInline: `calc(var(--k) * ${c.gap}vw)`,
            transform: `translateY(${c.dy}%) rotate(${c.r}deg)`,
          }}
        >
          <ChiliMark className="block w-full" body={TONES[c.tone].body} stem={TONES[c.tone].stem} />
        </span>
      ))}
    </motion.div>
  );
}
