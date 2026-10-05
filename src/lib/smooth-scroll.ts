import type Lenis from "lenis";

/**
 * One shared Lenis instance (created by <SmoothScroll/>). Everything that
 * scrolls the page programmatically or locks it goes through here, so smooth
 * scrolling never fights anchors, modals or the tablet's own scroller.
 */
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

/** Scroll to an element; smooth via Lenis when active, native otherwise. */
export function scrollToElement(el: HTMLElement, smooth = true) {
  if (instance) {
    // Lenis already honours <html>'s scroll-padding-top (= the navbar height),
    // so no extra offset here — subtracting it again landed a navbar too high.
    instance.scrollTo(el, { immediate: !smooth, duration: 1.6 });
    return;
  }
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

/** Scroll to an absolute page offset; smooth via Lenis when active. */
export function scrollToY(y: number, smooth = true) {
  if (instance) {
    instance.scrollTo(y, { immediate: !smooth, duration: 1.2 });
    return;
  }
  window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
}

export function lockScroll(locked: boolean) {
  if (!instance) return;
  if (locked) instance.stop();
  else instance.start();
}
