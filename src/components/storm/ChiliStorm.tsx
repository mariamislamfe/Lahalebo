"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useMotionMode } from "@/hooks/useMediaQuery";
import { ChiliMark } from "@/components/brand/Chili";

/**
 * HERO → MENU: the chili storm. Pinned and scrubbed to the scroll:
 *   the room heats up (orange → red → deep red), rows of chilies sweep across
 *   in alternating directions until they fill the screen, «زوّد شطة.» rides
 *   inside the storm, then it clears back to orange — the menu starts on that
 *   same orange, so there is no seam. Motion "off": no storm at all.
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

export function ChiliStorm() {
  const still = useMotionMode() === "off";
  const ref = useRef<HTMLDivElement>(null);
  // 0 = the storm pins under the navbar · 1 = it has fully played and lets go
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // room temperature — starts and ends on the hero / menu orange
  const bg = useTransform(p, [0, 0.22, 0.4, 0.8, 0.96], ["#f26a1b", "#c21c10", "#8e0f0c", "#8e0f0c", "#f26a1b"]);
  const wordScale = useTransform(p, [0.24, 0.42], [0.55, 1]);
  const wordOpacity = useTransform(p, [0.24, 0.34, 0.74, 0.86], [0, 1, 1, 0]);
  const wordRot = useTransform(p, [0.24, 0.86], [-8, 4]);

  if (still) return null;

  return (
    <div ref={ref} aria-hidden="true" className="relative h-[260vh]">
      <motion.div style={{ backgroundColor: bg }} className="sticky top-[var(--nav-h)] h-[calc(100svh-var(--nav-h))] overflow-hidden [--k:1.9] md:[--k:1]">
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
    </div>
  );
}

function StormRow({ p, row, index }: { p: MotionValue<number>; row: Chili[]; index: number }) {
  const start = index * 0.025;
  // the storm runs until just before the end — then the orange is clear for the menu
  const end = 0.94 - (5 - index) * 0.015;
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
