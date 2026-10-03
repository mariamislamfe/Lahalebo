import { cn } from "@/lib/format";

/**
 * Small physical things that make the table a Lahalebo table.
 * Pure CSS/SVG — no images, no invented products (sauce cups are the koshary
 * sides visible in the brand's own posts).
 */

export function SauceCup({ kind, className }: { kind: "shatta" | "da2a"; className?: string }) {
  const fill =
    kind === "shatta"
      ? "radial-gradient(circle at 38% 35%, #ff5a3c 0%, #c8150f 55%, #8e0d0a 100%)"
      : "radial-gradient(circle at 38% 35%, #f3b25a 0%, #c9791f 60%, #8f4f12 100%)";
  return (
    <div
      aria-hidden="true"
      className={cn("aspect-square rounded-full bg-white p-[9%] shadow-object", className)}
      style={{ boxShadow: "inset 0 -4px 0 rgb(0 0 0 / 0.06), var(--shadow-object)" }}
    >
      <div className="relative size-full rounded-full" style={{ background: fill }}>
        <span className="absolute top-[22%] left-[26%] h-[16%] w-[26%] -rotate-12 rounded-full bg-white/45 blur-[1px]" />
      </div>
    </div>
  );
}

/** Scattered chickpeas — the koshary crumbs. Deterministic positions. */
export function Chickpeas({ className, count = 9 }: { className?: string; count?: number }) {
  const pts = [
    [8, 12, 1],
    [22, 40, 0.8],
    [35, 8, 0.9],
    [55, 30, 1.1],
    [70, 12, 0.8],
    [82, 44, 1],
    [14, 70, 0.9],
    [46, 64, 0.8],
    [76, 80, 1],
  ].slice(0, count);
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={cn("pointer-events-none", className)}>
      {pts.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <ellipse cx="0" cy="1.4" rx="4.2" ry="3.6" fill="rgb(60 20 5 / 0.22)" />
          <circle r="4" fill="#e9c77f" />
          <circle cx="-1.2" cy="-1.3" r="1.4" fill="#fbe7b5" />
          <path d="M-2.6 1.8 Q0 3.4 2.6 1.6" stroke="#b98c3e" strokeWidth=".7" fill="none" />
        </g>
      ))}
    </svg>
  );
}

/** Paper napkin with a Ruqaa scribble. */
export function Napkin({ text, className }: { text: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid aspect-square place-items-center rounded-sm bg-white shadow-object", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgb(0 0 0 / 0.025) 0 2px, transparent 2px 7px), linear-gradient(135deg, #fff, #f3ece2)",
      }}
    >
      <span className="font-display -rotate-6 px-2 text-center text-[clamp(1.1rem,2.2vw,1.9rem)] leading-tight font-extrabold text-chili">
        {text}
      </span>
    </div>
  );
}
