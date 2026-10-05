"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/format";
import { WINK_EVENT } from "@/lib/wink";
import { Logo } from "./Logo";

/**
 * THE PEPPER WINKS. Logo + one tiny eye — not a mascot.
 * The official logo stays untouched; the eye is a separate SVG layer on the
 * chili's head, invisible at rest. One ~1.4s take:
 *   the eye opens → glances at the page → looks at you → winks → tucks away.
 * Budget (see lib/wink): page load, plus one encore on the first condiment.
 */

// Eye position on the logo artwork (percent of the logo box).
const EYE = { left: "73%", top: "12%", size: "17%" };
const DURATION = 1400;

export function WinkingLogo({
  className,
  delay = 1500,
  play = true,
  listen = false,
  sizes,
  preload,
  alive = true,
}: {
  className?: string;
  /** ms after mount before the first wink. */
  delay?: number;
  /** Wink once on mount. */
  play?: boolean;
  /** Also wink when the encore event fires (navbar only). */
  listen?: boolean;
  sizes?: string;
  preload?: boolean;
  /** Hover tilt on the logo image. */
  alive?: boolean;
}) {
  const eyeRef = useRef<SVGSVGElement>(null);
  const anims = useRef<Animation[]>([]);
  const clipId = `lh-eye-${useId().replace(/:/g, "")}`;

  const wink = useCallback(() => {
    const eye = eyeRef.current;
    if (!eye || document.documentElement.dataset.motion === "off") return;
    const pupil = eye.querySelector<SVGGElement>("[data-pupil]");
    const lid = eye.querySelector<SVGRectElement>("[data-lid]");
    if (!pupil || !lid) return;
    anims.current.forEach((a) => a.cancel());
    const opts = { duration: DURATION, fill: "both" as const };

    anims.current = [
      // open (springy per segment), stay, tuck away
      eye.animate(
        [
          { transform: "scale(0) rotate(-20deg)", opacity: 0, easing: "cubic-bezier(0.34,1.56,0.64,1)" },
          { transform: "scale(1.12) rotate(4deg)", opacity: 1, offset: 0.1, easing: "ease-out" },
          { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.16 },
          { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.86, easing: "cubic-bezier(0.4,0,1,1)" },
          { transform: "scale(0) rotate(10deg)", opacity: 0 },
        ],
        opts,
      ),
      // glance toward the page, then straight at the visitor
      pupil.animate(
        [
          { transform: "translate(4px,-1px)" },
          { transform: "translate(4px,-1px)", offset: 0.22, easing: "cubic-bezier(0.22,1,0.36,1)" },
          { transform: "translate(-1px,2px)", offset: 0.34 },
          { transform: "translate(-1px,2px)" },
        ],
        opts,
      ),
      // the wink: one quick lid drop
      lid.animate(
        [
          { transform: "scaleY(0)" },
          { transform: "scaleY(0)", offset: 0.44 },
          { transform: "scaleY(1)", offset: 0.52 },
          { transform: "scaleY(1)", offset: 0.57 },
          { transform: "scaleY(0)", offset: 0.65 },
          { transform: "scaleY(0)" },
        ],
        opts,
      ),
    ];
  }, []);

  useEffect(() => {
    if (!play) return;
    const timer = window.setTimeout(wink, delay);
    return () => window.clearTimeout(timer);
  }, [play, delay, wink]);

  useEffect(() => {
    if (!listen) return;
    window.addEventListener(WINK_EVENT, wink);
    return () => window.removeEventListener(WINK_EVENT, wink);
  }, [listen, wink]);

  useEffect(() => () => anims.current.forEach((a) => a.cancel()), []);

  return (
    <span className={cn("relative inline-block", className)}>
      <Logo className="w-full" sizes={sizes} preload={preload} alive={alive} />
      <svg
        ref={eyeRef}
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="pointer-events-none absolute origin-center opacity-0 drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]"
        style={{ left: EYE.left, top: EYE.top, width: EYE.size }}
      >
        <defs>
          <clipPath id={clipId}>
            <ellipse cx="20" cy="20" rx="14" ry="16" />
          </clipPath>
        </defs>
        <ellipse cx="20" cy="20" rx="16.5" ry="18.5" fill="#1c1311" />
        <ellipse cx="20" cy="20" rx="14" ry="16" fill="#fff" />
        <g clipPath={`url(#${clipId})`}>
          <g data-pupil="">
            <circle cx="20" cy="22" r="7.5" fill="#1c1311" />
            <circle cx="17.5" cy="19" r="2.4" fill="#fff" />
          </g>
          <rect data-lid="" x="0" y="0" width="40" height="40" fill="#d7201a" style={{ transformOrigin: "20px 2px", transform: "scaleY(0)" }} />
        </g>
      </svg>
    </span>
  );
}
