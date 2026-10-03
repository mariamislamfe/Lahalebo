"use client";

import { useEffect, useRef, type RefObject } from "react";
import { lockScroll } from "@/lib/smooth-scroll";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let lockCount = 0;

/**
 * Modal a11y essentials: Esc to close, Tab trapped inside, body scroll
 * locked (with scrollbar compensation), and focus returned on close.
 */
export function useModal(open: boolean, panelRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    // Scroll lock
    lockCount++;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    if (lockCount === 1) {
      lockScroll(true);
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingInlineEnd = `${scrollbar}px`;
    }

    // Initial focus: [data-autofocus] → first focusable → panel
    const raf = requestAnimationFrame(() => {
      const target =
        panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      target?.focus({ preventScroll: true });
    });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      lockCount--;
      if (lockCount === 0) {
        lockScroll(false);
        body.style.overflow = "";
        body.style.paddingInlineEnd = "";
      }
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, panelRef]);
}
