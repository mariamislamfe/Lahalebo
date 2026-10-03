"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon } from "@/components/ui/Icons";

interface Toast {
  id: number;
  title: string;
  body?: string;
}

const ToastContext = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((t: Omit<Toast, "id">) => {
    clearTimeout(timer.current);
    setToast({ ...t, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Top of the screen: never covers the cart bar or a sheet's main button. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(var(--nav-h)+0.75rem)] z-[60] flex justify-center px-4"
      >
        <AnimatePresence mode="popLayout">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
              className="flex max-w-sm items-center gap-3 rounded-2xl bg-coal px-4 py-3 text-cream shadow-pop"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf-bright text-coal">
                <CheckIcon size={18} strokeWidth={2.6} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{toast.title}</span>
                {toast.body && <span className="block text-[13px] text-cream/70">{toast.body}</span>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
