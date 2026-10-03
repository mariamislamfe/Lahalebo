"use client";

import { cn, formatNumber } from "@/lib/format";
import { MinusIcon, PlusIcon, TrashIcon } from "./Icons";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Shows a trash icon instead of minus at the minimum, and allows reaching 0. */
  removable?: boolean;
  label: string;
  size?: "sm" | "md";
  tone?: "light" | "chili";
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  removable,
  label,
  size = "md",
  tone = "light",
  className,
}: Props) {
  const floor = removable ? 0 : min;
  const atMin = value <= min;
  const btn = cn(
    "grid place-items-center rounded-full transition-colors duration-150 disabled:opacity-35",
    size === "sm" ? "size-8" : "size-10",
    tone === "chili" ? "text-cream hover:bg-white/15" : "text-coal hover:bg-coal/8",
  );

  return (
    <div
      role="group"
      aria-label={`الكمية: ${label}`}
      className={cn(
        "inline-flex items-center rounded-full p-0.5",
        tone === "chili" ? "bg-chili text-cream" : "bg-cream ring-1 ring-coal/12",
        className,
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="زوّد واحد"
      >
        <PlusIcon size={size === "sm" ? 16 : 18} />
      </button>
      <output
        aria-live="polite"
        className={cn("min-w-7 text-center font-bold tabular-nums", size === "sm" ? "text-sm" : "text-base")}
      >
        {formatNumber(value)}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(floor, value - 1))}
        disabled={!removable && atMin}
        aria-label={removable && atMin ? "شيل من السلة" : "قلّل واحد"}
      >
        {removable && atMin ? <TrashIcon size={size === "sm" ? 15 : 17} /> : <MinusIcon size={size === "sm" ? 16 : 18} />}
      </button>
    </div>
  );
}
