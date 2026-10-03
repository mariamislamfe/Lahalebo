"use client";

import { useMotionMode } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/format";
import { setMotionMode, type MotionMode } from "@/lib/motion-pref";

const OPTIONS: { mode: MotionMode; label: string }[] = [
  { mode: "full", label: "كاملة" },
  { mode: "calm", label: "هادية" },
  { mode: "off", label: "مقفولة" },
];

/** Visitor control for motion. Defaults: full, or calm when the device asks for less. */
export function MotionSwitch() {
  const mode = useMotionMode();
  return (
    <div role="radiogroup" aria-label="الحركة في الموقع" className="inline-flex items-center gap-1 rounded-full bg-black/15 p-1 text-sm">
      <span className="px-2 text-cream/70">الحركة</span>
      {OPTIONS.map((o) => (
        <button
          key={o.mode}
          type="button"
          role="radio"
          aria-checked={mode === o.mode}
          onClick={() => {
            setMotionMode(o.mode);
            // Scroll scenes swap between moving/still layouts — keep the visitor oriented.
            if (o.mode === "off" || mode === "off") window.scrollTo({ top: 0 });
          }}
          className={cn("h-8 rounded-full px-3 font-bold transition-colors", mode === o.mode ? "bg-cream text-leaf-deep" : "text-cream hover:bg-white/10")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
