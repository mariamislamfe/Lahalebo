"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useMotionMode } from "@/hooks/useMediaQuery";
import { ChiliMark } from "@/components/brand/Chili";

/**
 * HERO → MENU: the chili storm.
 *
 * Not a section you scroll through on its own — a screen-filling layer that
 * plays over the seam between the hero and the menu, so nothing empty ever
 * shows:
 *   · it starts while the hero is still on screen (the chilies close over it),
 *   · the room heats up and fills with chilies, «زوّد شطة.» in the middle,
 *   · it clears exactly as the menu's top reaches the navbar (it opens onto it).
 * The spacer below only buys scroll distance; it is always hidden under the storm.
 * Motion "off": no storm, the hero runs straight into the menu.
 */

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

const clear = "rgba(242, 106, 27, 0)";
const orange = "rgba(242, 106, 27, 1)";
const red = "rgba(194, 28, 16, 1)";
const deep = "rgba(142, 15, 12, 1)";

export function ChiliStorm() {
  const still = useMotionMode() === "off";
  const spacerRef = useRef<HTMLDivElement>(null);
  const geo = useRef({ start: 0, length: 1 });
  const { scrollY } = useScroll();

  // Progress in page pixels: 0 = the spacer's top reaches the bottom of the screen
  // (the hero is still fully visible) · 1 = the menu's top sits under the navbar.
  useEffect(() => {
    const el = spacerRef.current;
    if (!el) return;
    const measure = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const nav = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const vh = window.innerHeight;
      geo.current = { start: top - vh, length: Math.max(1, vh + el.offsetHeight - nav) };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [still]);

  const p = useTransform(scrollY, (y) => Math.min(1, Math.max(0, (y - geo.current.start) / geo.current.length)));

  // closes over the hero → hot → deep → back to the menu's orange → open
  const bg = useTransform(p, [0, 0.2, 0.34, 0.78, 0.9, 1], [clear, red, deep, deep, orange, clear]);
  const visibility = useTransform(p, (v) => (v > 0.001 && v < 0.999 ? "visible" : "hidden"));
  const wordScale = useTransform(p, [0.3, 0.46], [0.55, 1]);
  const wordOpacity = useTransform(p, [0.3, 0.4, 0.72, 0.84], [0, 1, 1, 0]);
  const wordRot = useTransform(p, [0.3, 0.84], [-8, 4]);

  if (still) return null;

  return (
    <>
      {/* scroll distance for the storm — always covered by it, same orange as hero and menu */}
      <div ref={spacerRef} aria-hidden="true" className="h-[120vh] bg-orange" />

      <motion.div
        aria-hidden="true"
        style={{ backgroundColor: bg, visibility }}
        className="pointer-events-none fixed inset-x-0 top-[var(--nav-h)] bottom-0 z-30 overflow-hidden [--k:1.9] md:[--k:1]"
      >
        <div className="absolute inset-[-15%] -rotate-[9deg]">
          {ROWS.map((row, i) => (
            <StormRow key={i} p={p} row={row} index={i} />
          ))}
        </div>
        <motion.p
          style={{ scale: wordScale, opacity: wordOpacity, rotate: wordRot }}
          className="shout-sign absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(4rem,15vw,12rem)] leading-[1.3] whitespace-nowrap text-cream [--sign-shadow:var(--color-chili-ink)] [--sign-shadow-2:rgb(0_0_0/0.35)]"
        >
          زوّد شطة.
        </motion.p>
      </motion.div>
    </>
  );
}

function StormRow({ p, row, index }: { p: MotionValue<number>; row: Chili[]; index: number }) {
  // rows enter one after another over the hero, and are all gone just before the menu opens
  const start = index * 0.025;
  const end = 0.93 - (5 - index) * 0.015;
  const rtl = index % 2 === 0;
  const x = useTransform(p, [start, end], rtl ? ["105vw", "-230vw"] : ["-230vw", "105vw"]);
  const opacity = useTransform(p, [start, start + 0.02, end - 0.02, end], [0, 1, 1, 0]);
  return (
    <motion.div style={{ x, opacity, top: `${index * 19 - 4}%` }} className="absolute flex h-[30%] w-max items-center will-change-transform">
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
