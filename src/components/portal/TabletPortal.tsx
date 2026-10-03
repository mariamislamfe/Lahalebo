"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import type { Product } from "@/types/menu";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useProgress } from "@/hooks/useProgress";
import { cn } from "@/lib/format";
import { ChiliMark } from "@/components/brand/Chili";
import { Chickpeas, Napkin, SauceCup } from "./TableProps";
import { FoodImage } from "@/components/ui/FoodImage";
import { ORDER_ANCHOR } from "@/lib/order-nav";
import { OrderApp } from "./OrderApp";

/**
 * THE ORDERING PORTAL — brand experience → actual ordering.
 *
 * A real-looking tablet lies on the Lahalebo table, seen at a steep angle.
 * Scrolling drops the camera over it (the table plane un-tilts), pushes in
 * until the screen is the viewport and the table falls away. Then it holds:
 * the screen is the ordering app (the only menu on the site) and its list
 * scrolls inside the screen. #order marks that moment for every order link.
 * Phones get a phone: same element, portrait viewport.
 */
export function TabletPortal({ tableFood }: { tableFood: Product[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Motion off: skip the camera — the app is simply there, full size.
  const still = useMotionValue(1);
  const p = reduce ? still : scrollYProgress;

  const tilt = useProgress(p, [0.04, 0.62], [desktop ? 50 : 38, 0]);
  const planeY = useProgress(p, [0.04, 0.62], [desktop ? "10%" : "6%", "0%"]);
  const deviceScale = useProgress(p, [0.04, 0.8], [desktop ? 0.7 : 0.74, 1]);
  const deviceRotate = useProgress(p, [0.04, 0.6], [desktop ? -7 : -4, 0]);
  const radius = useProgress(p, [0.6, 0.8], [desktop ? 48 : 56, 0]);
  const glare = useProgress(p, [0.3, 0.8], [1, 0]);
  const headOpacity = useProgress(p, [0, 0.1], [1, 0]);

  // The app's own list only scrolls once the tablet fills the screen.
  const [live, setLive] = useState(reduce);
  useMotionValueEvent(p, "change", (v) => setLive(v >= 0.8));

  return (
    <section ref={ref} aria-labelledby="portal-title" className={cn("relative", reduce ? "" : "h-[300vh] md:h-[340vh]")}>
      {/* Where every "order" link lands: the scroll position at which the tablet fills the screen. */}
      <span
        id={ORDER_ANCHOR}
        aria-hidden="true"
        className={cn("absolute inset-x-0", reduce ? "top-0" : "bottom-[calc(100svh-var(--nav-h))]")}
      />
      <div className="sticky top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))] overflow-hidden bg-[#e98a2c] [perspective:1500px] [perspective-origin:50%_30%]">
        {/* the table plane */}
        <motion.div style={{ rotateX: tilt, y: planeY }} className="absolute inset-0 origin-[50%_70%] [transform-style:preserve-3d]">
          <div className="surface-tiles absolute inset-[-60%] [--tile:92px] md:[--tile:130px]" />

          <TableThing p={p} className="top-[-8%] right-[-6%] w-[46%] md:top-[-6%] md:right-[2%] md:w-[20%]" rot={-10} out={{ x: 40, y: -30 }}>
            <FoodImage image={tableFood[0]?.image} label={tableFood[0]?.name ?? ""} sizes="(min-width: 768px) 20vw, 46vw" className="aspect-[433/528]" />
          </TableThing>
          <TableThing p={p} className="bottom-[-4%] left-[-10%] w-[56%] md:bottom-[-2%] md:left-[1%] md:w-[26%]" rot={12} out={{ x: -40, y: 30 }}>
            <FoodImage image={tableFood[1]?.image} label={tableFood[1]?.name ?? ""} sizes="(min-width: 768px) 26vw, 56vw" className="aspect-[478/500]" />
          </TableThing>
          <TableThing p={p} className="top-[4%] left-[-12%] hidden w-[30%] md:block" rot={-18} out={{ x: -40, y: -30 }}>
            <FoodImage image={tableFood[2]?.image} label={tableFood[2]?.name ?? ""} sizes="30vw" className="aspect-[421/238]" />
          </TableThing>
          <TableThing p={p} className="right-[6%] bottom-[4%] w-[16%] md:right-[22%] md:bottom-[2%] md:w-[7%]" rot={0} out={{ x: 20, y: 40 }}>
            <SauceCup kind="shatta" />
          </TableThing>
          <TableThing p={p} className="right-[24%] bottom-[2%] w-[13%] md:right-[30%] md:bottom-[6%] md:w-[5.5%]" rot={0} out={{ x: 10, y: 40 }}>
            <SauceCup kind="da2a" />
          </TableThing>
          <TableThing p={p} className="top-[40%] right-[3%] hidden w-[12%] md:block" rot={14} out={{ x: 40, y: 0 }}>
            <Napkin text="زوّد شطة؟" />
          </TableThing>
          <TableThing p={p} className="top-[6%] left-[36%] w-[20%] md:w-[8%]" rot={130} out={{ x: 0, y: -40 }}>
            <ChiliMark className="w-full drop-shadow-[0_10px_8px_rgb(60_20_5/0.35)]" />
          </TableThing>
          <TableThing p={p} className="inset-x-0 bottom-0 h-[30%]" rot={0} out={{ x: 0, y: 30 }}>
            <Chickpeas className="absolute bottom-[10%] left-[40%] w-[30%] md:w-[14%]" />
          </TableThing>

          {/* the tablet (phone on phones) */}
          <motion.div style={{ scale: deviceScale, rotate: deviceRotate }} className="absolute inset-0 z-10">
            {/* cast shadow on the tiles */}
            <span aria-hidden="true" className="absolute inset-[3%] translate-y-[6%] rounded-[3rem] bg-black/45 blur-3xl" />
            <motion.div
              style={{
                borderRadius: radius,
                boxShadow: desktop
                  ? "0 0 0 26px #111113, 0 0 0 29px #3a3a40, 0 0 0 31px #9a9aa2, 0 0 0 33px #55555c"
                  : "0 0 0 18px #111113, 0 0 0 21px #3a3a40, 0 0 0 23px #9a9aa2, 0 0 0 24px #55555c",
              }}
              className="absolute inset-0 overflow-hidden bg-coal"
            >
              <div className="absolute inset-0">
                <OrderApp live={live} />
              </div>
              {/* glass */}
              <motion.span
                aria-hidden="true"
                style={{ opacity: glare }}
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.16)_0%,transparent_32%)]"
              />
            </motion.div>
            {/* front camera on the bezel */}
            <span aria-hidden="true" className="absolute top-[-15px] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#2b2b33] ring-2 ring-[#1a1a20] md:top-[-17px]" />
          </motion.div>
        </motion.div>

        {/* STEAM WALL — the steam rising off the featured koshary arrives as a wall and clears onto the table */}
        {!reduce && <SteamGate p={p} />}

        {/* screen-space heading */}
        <motion.div style={{ opacity: headOpacity }} className="pointer-events-none absolute inset-x-0 top-4 z-20 text-center md:top-6">
          <h2 id="portal-title" className="font-display text-section font-extrabold text-cream [text-shadow:0_4px_0_rgb(92_10_12/0.3)]">
            اطلب من هنا.
          </h2>
          <p className="font-display text-xl font-bold text-cream/90">التابلت على الترابيزة — كمّل نزول</p>
        </motion.div>
      </div>
    </section>
  );
}

const GATE = [
  { l: "-18%", t: "10%", w: "70%", src: "/fx/steam-puff-0.webp", dx: "-12%" },
  { l: "30%", t: "-6%", w: "80%", src: "/fx/steam-puff-1.webp", dx: "10%" },
  { l: "-4%", t: "44%", w: "76%", src: "/fx/steam-column-2.webp", dx: "-6%" },
  { l: "46%", t: "40%", w: "70%", src: "/fx/steam-column-3.webp", dx: "14%" },
];

function SteamGate({ p }: { p: MotionValue<number> }) {
  const veil = useProgress(p, [0, 0.08, 0.16], [0.95, 0.7, 0]);
  const puffs = useProgress(p, [0.02, 0.2], [1, 0]);
  const y = useProgress(p, [0, 0.2], ["0%", "-45%"]);
  const scale = useProgress(p, [0, 0.2], [1, 1.7]);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-40">
      <motion.span style={{ opacity: veil }} className="absolute inset-0 bg-[#fff6ec]" />
      <motion.div style={{ opacity: puffs, y, scale }} className="absolute inset-0">
        {GATE.map((g) => (
          <motion.span
            key={g.src}
            className="absolute aspect-square bg-contain bg-center bg-no-repeat"
            style={{ left: g.l, top: g.t, width: g.w, x: g.dx, backgroundImage: `url(${g.src})` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function TableThing({
  p,
  className,
  rot,
  out,
  children,
}: {
  p: MotionValue<number>;
  className: string;
  rot: number;
  out: { x: number; y: number };
  children: ReactNode;
}) {
  const x = useProgress(p, [0.25, 0.62], ["0vw", `${out.x}vw`]);
  const y = useProgress(p, [0.25, 0.62], ["0vh", `${out.y}vh`]);
  const opacity = useProgress(p, [0.38, 0.62], [1, 0]);
  return (
    <motion.div aria-hidden="true" style={{ x, y, opacity, rotate: rot }} className={cn("pointer-events-none absolute", className)}>
      {children}
    </motion.div>
  );
}
