/**
 * Ordering lives inside the tablet. Every "order / menu" action on the page
 * goes through here and lands the visitor straight on the tablet (fully
 * zoomed, ready to order) — no long scroll through the whole page:
 * a red curtain sweeps in, the page jumps behind it, the curtain opens.
 */
import { scrollToElement } from "./smooth-scroll";

export const ORDER_ANCHOR = "order";
export const ORDER_EVENT = "lahalebo:order";

export interface OrderEventDetail {
  categoryId?: string;
}

let busy = false;

export function openOrder(categoryId?: string) {
  const anchor = document.getElementById(ORDER_ANCHOR);
  const announce = () => window.dispatchEvent(new CustomEvent<OrderEventDetail>(ORDER_EVENT, { detail: { categoryId } }));
  if (!anchor) return;

  // Already (almost) there: just glide.
  const distance = Math.abs(anchor.getBoundingClientRect().top);
  const still = document.documentElement.dataset.motion === "off";
  if (still || distance < window.innerHeight * 1.2) {
    scrollToElement(anchor, !still && distance > 4);
    announce();
    return;
  }
  if (busy) return;
  busy = true;

  const curtain = document.createElement("div");
  curtain.setAttribute("aria-hidden", "true");
  Object.assign(curtain.style, {
    position: "fixed",
    inset: "0",
    zIndex: "80",
    background: "var(--color-chili)",
    transform: "translateX(100%)",
    pointerEvents: "none",
  });
  document.body.appendChild(curtain);

  const ease = "cubic-bezier(0.7, 0, 0.3, 1)";
  curtain
    .animate([{ transform: "translateX(100%)" }, { transform: "translateX(0%)" }], { duration: 320, easing: ease, fill: "forwards" })
    .finished.then(() => {
      scrollToElement(anchor, false);
      announce();
      // two frames so the scroll-linked tablet settles before we reveal it
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          curtain
            .animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], { duration: 420, easing: ease, fill: "forwards" })
            .finished.finally(() => {
              curtain.remove();
              busy = false;
            });
        }),
      );
    })
    .catch(() => {
      curtain.remove();
      busy = false;
    });
}
