"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/format";
import { Logo } from "./Logo";

/**
 * THE PEPPER WINKS.
 * The official logo stays untouched; the eye is a separate SVG layer sitting
 * on the chili's head (next to the stem). Timeline (~1.5s, plays once):
 *   eye pops open → pupil turns to look at you → quick wink → eye tucks away.
 * Used twice only: first page load (navbar) and a placed order (confirmation).
 */

// Eye position on the logo artwork (percent of the logo box).
const EYE = { left: "73%", top: "12%", size: "17%" };

export function WinkingLogo({
  className,
  delay = 1300,
  play = true,
  sizes,
  preload,
  track = false,
  alive = true,
}: {
  className?: string;
  /** ms after mount before the wink starts. */
  delay?: number;
  play?: boolean;
  sizes?: string;
  preload?: boolean;
  /** Keep the eye open and let the pupil follow the pointer (final section). No wink. */
  track?: boolean;
  /** Hover tilt on the logo image. */
  alive?: boolean;
}) {
  const eyeRef = useRef<SVGSVGElement>(null);
  const clipId = `lh-eye-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const eye = eyeRef.current;
    if (!eye || !play) return;
    if (document.documentElement.dataset.motion === "off") return;
    const pupil = eye.querySelector<SVGGElement>("[data-pupil]");
    const lid = eye.querySelector<SVGRectElement>("[data-lid]");
    if (!pupil || !lid) return;

    const opts = (d: number, extra: KeyframeAnimationOptions = {}) => ({ duration: d, fill: "both" as const, ...extra });
    const anims: Animation[] = [];
    const timer = window.setTimeout(() => {
      // 1) pop open, stay, tuck away
      anims.push(
        eye.animate(
          [
            // springy easing per segment — a whole-timeline overshoot would skip keyframes
            { transform: "scale(0) rotate(-20deg)", opacity: 0, easing: "cubic-bezier(0.34,1.56,0.64,1)" },
            { transform: "scale(1.15) rotate(4deg)", opacity: 1, offset: 0.1, easing: "ease-out" },
            { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.16 },
            { transform: "scale(1) rotate(0deg)", opacity: 1, offset: 0.86, easing: "cubic-bezier(0.4,0,1,1)" },
            { transform: "scale(0) rotate(10deg)", opacity: 0 },
          ],
          opts(1500),
        ),
      );
      // 2) pupil: looks toward the text, then straight at the visitor
      anims.push(
        pupil.animate(
          [
            { transform: "translate(4px,-1px)" },
            { transform: "translate(4px,-1px)", offset: 0.2, easing: "cubic-bezier(0.22,1,0.36,1)" },
            { transform: "translate(-1px,2px)", offset: 0.34 },
            { transform: "translate(-1px,2px)" },
          ],
          opts(1500),
        ),
      );
      // 3) the wink
      anims.push(
        lid.animate(
          [
            { transform: "scaleY(0)" },
            { transform: "scaleY(0)", offset: 0.42 },
            { transform: "scaleY(1)", offset: 0.5 },
            { transform: "scaleY(1)", offset: 0.56 },
            { transform: "scaleY(0)", offset: 0.64 },
            { transform: "scaleY(0)" },
          ],
          opts(1500),
        ),
      );
    }, delay);

    return () => {
      window.clearTimeout(timer);
      anims.forEach((a) => a.cancel());
    };
  }, [play, delay]);

  // Character mode: the eye stays open and watches the pointer.
  useEffect(() => {
    const eye = eyeRef.current;
    if (!eye || !track) return;
    const pupil = eye.querySelector<SVGGElement>("[data-pupil]");
    if (!pupil) return;
    // A continuous loop: full motion only.
    if (document.documentElement.dataset.motion !== "full") return;
    let frame = 0;
    let px = 0;
    let py = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = eye.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2);
        const dy = py - (r.top + r.height / 2);
        const len = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, len / 220);
        pupil.style.transform = `translate(${((dx / len) * 5 * k).toFixed(2)}px, ${((dy / len) * 5 * k).toFixed(2)}px)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [track]);

  return (
    <span className={cn("relative inline-block", className)}>
      <Logo className="w-full" sizes={sizes} preload={preload} alive={alive} />
      <svg
        ref={eyeRef}
        viewBox="0 0 40 40"
        aria-hidden="true"
        className={cn("pointer-events-none absolute origin-center drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]", track ? "opacity-100" : "opacity-0")}
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
          <g data-pupil="" style={{ transition: "transform 120ms ease-out" }}>
            <circle cx="20" cy="22" r="7.5" fill="#1c1311" />
            <circle cx="17.5" cy="19" r="2.4" fill="#fff" />
          </g>
          <rect data-lid="" x="0" y="0" width="40" height="40" fill="#d7201a" style={{ transformOrigin: "20px 2px", transform: "scaleY(0)" }} />
        </g>
      </svg>
    </span>
  );
}
