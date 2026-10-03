import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

/**
 * CTA hierarchy (labels live in content/copy.ts):
 *  primary   → red, the ordering action. One per view.
 *  secondary → green outline, browsing actions.
 *  ghost     → quiet text actions.
 *  inverse   → cream on dark/red fields.
 */
type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-[transform,background-color,color,box-shadow] duration-200 ease-calm active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "bg-chili text-cream shadow-cta hover:bg-chili-deep",
  secondary: "border-2 border-leaf text-leaf hover:bg-leaf hover:text-cream",
  ghost: "text-coal hover:bg-coal/5",
  inverse: "bg-cream text-chili hover:bg-white",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-14 px-7 text-[17px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function LinkButton({ variant, size, className, ...rest }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}
