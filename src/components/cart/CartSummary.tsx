import type { ReactNode } from "react";
import { siteConfig, type Fulfillment } from "@/config/site";
import { cn, formatPrice } from "@/lib/format";

export function orderTotal(subtotal: { total: number; complete: boolean }, fulfillment: Fulfillment) {
  const fee = fulfillment === "delivery" ? (siteConfig.ordering.deliveryFee ?? 0) : 0;
  return { fee, total: subtotal.total + fee };
}

/** Food / delivery / total. */
export function CartSummary({
  subtotal,
  fulfillment = "delivery",
  tone = "light",
}: {
  subtotal: { total: number; complete: boolean };
  fulfillment?: Fulfillment;
  tone?: "light" | "dark";
}) {
  const { fee, total } = orderTotal(subtotal, fulfillment);
  const muted = tone === "light" ? "text-smoke" : "text-cream/75";
  return (
    <dl className="space-y-1.5 text-[15px]">
      <Row label="الأكل" muted={muted}>{formatPrice(subtotal.total)}</Row>
      {fulfillment === "delivery" && <Row label="التوصيل" muted={muted}>{formatPrice(fee)}</Row>}
      <div className={cn("flex justify-between border-t pt-2 text-lg font-bold", tone === "light" ? "border-coal/12" : "border-cream/25")}>
        <dt>الإجمالي</dt>
        <dd className={cn("font-display text-2xl leading-none tabular-nums", tone === "light" ? "text-chili" : "text-cream")}>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

function Row({ label, muted, children }: { label: string; muted: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={muted}>{label}</dt>
      <dd className="tabular-nums">{children}</dd>
    </div>
  );
}
