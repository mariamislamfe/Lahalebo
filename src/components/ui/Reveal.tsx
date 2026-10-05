"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Scroll reveal. One shared IntersectionObserver for the page; elements
 * unobserve after entering so nothing runs once seen. Styles in globals.css:
 *   data-reveal=""      swings up from a pivot below (the house motion)
 *   data-reveal="mask"  unmasked bottom-up, the photo settles inside
 */

let observer: IntersectionObserver | null = null;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            observer?.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
  }
  return observer;
}

/** Mounted once: observes every [data-reveal] on the page, including ones added later. */
export function RevealObserver() {
  useEffect(() => {
    const obs = getObserver();
    const scan = (root: ParentNode) => root.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => obs.observe(el));
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && (n.matches("[data-reveal]") ? obs.observe(n) : scan(n)));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return null;
}

export function Reveal({
  as: Tag = "div",
  delay = 0,
  mask,
  className,
  children,
}: {
  as?: ElementType;
  delay?: number;
  mask?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = getObserver();
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);

  return (
    <Tag ref={ref} data-reveal={mask ? "mask" : ""} className={className} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
