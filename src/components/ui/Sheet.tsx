"use client";

import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useIsClient, useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useModal } from "@/hooks/useModal";
import { cn } from "@/lib/format";

/**
 * One modal primitive, three shapes:
 *  - phones: bottom sheet (thumb-reachable, drag handle to dismiss)
 *  - desktop "dialog": centered card (product configuration)
 *  - desktop "drawer": full-height side panel on the reading-end side (cart)
 */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: "dialog" | "drawer";
  children: ReactNode;
  className?: string;
}

const spring = { type: "spring", stiffness: 420, damping: 40, mass: 0.9 } as const;

export function Sheet(props: SheetProps) {
  const isClient = useIsClient();
  if (!isClient) return null;
  return createPortal(
    <AnimatePresence>{props.open && <SheetPanel key="sheet" {...props} />}</AnimatePresence>,
    document.body,
  );
}

function SheetPanel({ onClose, label, variant = "dialog", children, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 768px)");
  const reduce = usePrefersReducedMotion();
  const drag = useDragControls();
  useModal(true, panelRef, onClose);

  const shape = !desktop ? "sheet" : variant;

  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : shape === "sheet"
      ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
      : shape === "drawer"
        ? { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } }
        : {
            initial: { opacity: 0, y: 24, scale: 0.97 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 16, scale: 0.98 },
          };

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  }

  return (
    <div className={cn("fixed inset-0 z-50", shape === "dialog" && "grid place-items-center p-6")}>
      <motion.div
        className="absolute inset-0 bg-coal/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        {...motionProps}
        transition={spring}
        drag={shape === "sheet" && !reduce ? "y" : false}
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        data-lenis-prevent=""
        className={cn(
          "flex flex-col overflow-hidden outline-none",
          shape === "sheet" && "absolute inset-x-0 bottom-0 max-h-[94dvh] rounded-t-[1.75rem]",
          shape === "drawer" && "absolute inset-y-0 left-0 w-[min(460px,100vw)] shadow-pop",
          shape === "dialog" && "relative max-h-[88dvh] w-full max-w-[680px] rounded-panel shadow-pop",
          className ?? "bg-cream",
        )}
      >
        {shape === "sheet" && (
          <div
            className="absolute inset-x-0 top-0 z-10 flex h-6 cursor-grab touch-none justify-center pt-2 active:cursor-grabbing"
            onPointerDown={(e) => drag.start(e)}
            aria-hidden="true"
          >
            <span className="h-1.5 w-11 rounded-full bg-white/60 mix-blend-luminosity" />
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
