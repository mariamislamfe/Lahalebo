import Image from "next/image";
import type { ProductImage, Surface } from "@/types/menu";
import { cn } from "@/lib/format";
import { ChiliMark } from "@/components/brand/Chili";

export const surfaceClass: Record<Surface, string> = {
  orange: "surface-orange",
  red: "surface-red",
  leaf: "surface-leaf",
  cream: "surface-cream",
};

const posterText: Record<Surface, string> = {
  orange: "text-cream",
  red: "text-cream",
  leaf: "text-cream",
  cream: "text-chili",
};

interface FoodImageProps {
  image?: ProductImage;
  /** Dish name — alt fallback, and the poster text when there is no photo. */
  label: string;
  sizes: string;
  preload?: boolean;
  className?: string;
  /** Classes for the <img> itself (scale/translate a cutout past its box). */
  imgClassName?: string;
  /** Colour field behind the dish. Omit to float on the parent. */
  surface?: Surface;
  /** Cast shadow under cutouts. */
  grounded?: boolean;
}

/**
 * Every food visual goes through here.
 * - Cutout PNG → contained, grounded with a contact shadow.
 * - Full photo → cover, art-directed with `focus`.
 * - No photo → a brand poster: the dish name set big on its colour, with the chili.
 */
export function FoodImage({ image, label, sizes, preload, className, imgClassName, surface, grounded = true }: FoodImageProps) {
  const bg = surface ? surfaceClass[surface] : undefined;
  // Callers often position the image themselves; only default to `relative` when they don't.
  const position = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "") ? undefined : "relative";

  if (!image) {
    const s = surface ?? "orange";
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(position, "grid place-items-center overflow-hidden [container-type:inline-size]", surfaceClass[s], className)}
      >
        <ChiliMark
          className="absolute -right-[8%] -bottom-[18%] h-[80%] w-auto rotate-[30deg] opacity-25"
          body={s === "cream" ? "var(--color-chili)" : "var(--color-cream)"}
          stem={s === "leaf" ? "var(--color-cream)" : "var(--color-leaf)"}
        />
        <span
          aria-hidden="true"
          className={cn("font-display relative px-[6%] text-center text-[15cqw] leading-[0.95] font-extrabold -rotate-3", posterText[s])}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(position, bg, className)}>
      <Image
        src={image.src}
        alt={image.alt || label}
        fill
        sizes={sizes}
        preload={preload}
        className={cn(
          image.cutout ? "object-contain" : "object-cover",
          image.cutout && grounded && "drop-shadow-[0_22px_20px_rgb(60_20_5/0.38)]",
          imgClassName,
        )}
        style={image.focus ? { objectPosition: image.focus } : undefined}
      />
    </div>
  );
}
