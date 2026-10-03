import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/format";

/**
 * The real Lahalebo sticker logo (supplied asset — never redrawn).
 * Its die-cut white border lets it sit on any brand surface.
 * `alive` adds the chili's small tilt on hover.
 */
export function Logo({
  className,
  preload,
  alive = true,
  sizes = "160px",
}: {
  className?: string;
  preload?: boolean;
  alive?: boolean;
  sizes?: string;
}) {
  const { logo } = siteConfig;
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={`${siteConfig.name} كشري`}
      sizes={sizes}
      preload={preload}
      className={cn(
        "h-auto drop-shadow-[0_4px_6px_rgb(60_20_5/0.25)]",
        alive && "origin-[20%_60%] transition-transform duration-500 ease-chili hover:-rotate-6 hover:scale-105",
        className,
      )}
    />
  );
}
