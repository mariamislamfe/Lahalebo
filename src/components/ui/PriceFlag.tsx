import { cn, formatPrice } from "@/lib/format";

/**
 * Price tag cut in the logo's own silhouette: a red chili — pointed tip on
 * one side, green stem on the other. Lahalebo's signature label.
 */
export function PriceFlag({
  value,
  from,
  size = "md",
  tone = "chili",
  className,
}: {
  value: number | null;
  from?: boolean;
  size?: "sm" | "md" | "lg";
  tone?: "chili" | "cream";
  className?: string;
}) {
  const h = size === "lg" ? "h-12 text-2xl" : size === "sm" ? "h-7 text-[15px]" : "h-9 text-lg";
  const tip = size === "lg" ? "w-5 -left-[19px]" : size === "sm" ? "w-3 -left-[11px]" : "w-4 -left-[15px]";
  const fill = tone === "chili" ? "bg-chili text-cream" : "bg-cream text-chili";
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <span className={cn("font-display relative inline-flex items-center rounded-r-full ps-2 pe-4 leading-none font-extrabold whitespace-nowrap", h, fill)}>
        <span aria-hidden="true" className={cn("absolute top-0 h-full [clip-path:polygon(100%_0,100%_100%,0_50%)]", tip, fill)} />
        {from && <span className="me-1 text-[0.6em] font-bold opacity-80">من</span>}
        {formatPrice(value)}
      </span>
      <span aria-hidden="true" className="absolute -top-1.5 -right-1 h-3 w-4 rotate-[-24deg] rounded-full bg-leaf" />
    </span>
  );
}
