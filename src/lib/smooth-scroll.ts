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
    // land below the sticky navbar, like native scroll-padding does
    const nav = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    instance.scrollTo(el, { immediate: !smooth, duration: 1.6, offset: -nav });
    return;
  }
  el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

export function lockScroll(locked: boolean) {
  if (!instance) return;
  if (locked) instance.stop();
  else instance.start();
}
