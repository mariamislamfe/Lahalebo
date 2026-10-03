"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMotionMode } from "@/hooks/useMediaQuery";
import { setLenis } from "@/lib/smooth-scroll";

/**
 * Silky inertial scrolling for wheel/trackpad (touch stays native).
 * Off when motion is switched off. Scrollers that must keep native scrolling
 * (tablet menu, sheets) carry `data-lenis-prevent`.
 */
export function SmoothScroll() {
  const mode = useMotionMode();

  useEffect(() => {
    if (mode === "off") return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      wheelMultiplier: 1,
      anchors: false,
    });
    setLenis(lenis);
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, [mode]);

  return null;
}
