"use client";

import { useSyncExternalStore } from "react";
import { MOTION_EVENT, readMotionMode, type MotionMode } from "@/lib/motion-pref";

/** SSR-safe media query. Returns `false` on the server and first paint. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const noop = () => () => {};
/** True only after hydration on the client — for portals. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Current motion mode (see lib/motion-pref). Server + first client render: "full". */
export function useMotionMode(): MotionMode {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener(MOTION_EVENT, onChange);
      return () => window.removeEventListener(MOTION_EVENT, onChange);
    },
    readMotionMode,
    () => "full",
  );
}

/** True only when the visitor switched motion OFF — scenes render their still versions. */
export function usePrefersReducedMotion(): boolean {
  return useMotionMode() === "off";
}
