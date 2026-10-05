"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import type { Extra, Product } from "@/types/menu";
import { cta, microcopy } from "@/content/copy";
import { siteConfig } from "@/config/site";
import { useAddToCart } from "@/hooks/useAddToCart";
import { cn, formatPrice } from "@/lib/format";
import { defaultOptionId } from "@/lib/pricing";
import { useMenu } from "@/store/menu-context";
import { Button } from "@/components/ui/Button";
import { FoodImage, surfaceClass } from "@/components/ui/FoodImage";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { PriceFlag } from "@/components/ui/PriceFlag";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Sheet } from "@/components/ui/Sheet";

export function ProductSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <Sheet open={!!product} onClose={onClose} label={product?.name ?? ""} variant="dialog">
      {product && <ProductConfigurator key={product.id} product={product} onDone={onClose} />}
    </Sheet>
  );
}

function ProductConfigurator({ product, onDone }: { product: Product; onDone: () => void }) {
  const { categoryById } = useMenu();
  const addToCart = useAddToCart();
  const [optionId, setOptionId] = useState(() => defaultOptionId(product));
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [choiceIds, setChoiceIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);

  const option = product.options?.find((o) => o.id === optionId);
  const base = product.options?.length ? (option?.price ?? null) : product.price;
  const extras = (product.extras ?? []).filter((e) => extraIds.includes(e.id));
  const unit = base === null || extras.some((e) => e.price === null) ? null : base + extras.reduce((s, e) => s + (e.price ?? 0), 0);
  const canOrder = product.available && siteConfig.ordering.open;
  const surface = categoryById.get(product.categoryId)?.surface ?? "orange";

  const toggle = (set: typeof setExtraIds) => (id: string) =>
    set((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  function submit() {
    addToCart({ productId: product.id, optionId, extraIds, choiceIds, qty }, imageRef.current);
    onDone();
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          ref={imageRef}
          className={cn("relative h-[clamp(14rem,38vh,20rem)] overflow-hidden", surfaceClass[surface])}
        >
          <FoodImage
            image={product.image}
            label={product.name}
            sizes="(min-width: 768px) 680px, 100vw"
            className="absolute inset-x-[10%] top-[8%] bottom-[4%]"
          />
          <button
            type="button"
            onClick={onDone}
            aria-label="اقفل"
            className="absolute top-4 left-4 z-10 grid size-10 place-items-center rounded-full bg-cream text-coal shadow-card transition-transform hover:scale-105"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="space-y-6 px-5 pt-5 pb-6 md:px-7">
          <header>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-[2.2rem] leading-tight font-bold text-coal">{product.name}</h2>
              <PriceFlag value={unit} className="mt-2 shrink-0" />
            </div>
            {product.tagline && <p className="font-display mt-1 text-xl font-bold text-chili">{product.tagline}</p>}
            {product.description && <p className="mt-2 text-[15px] leading-relaxed text-smoke">{product.description}</p>}
            {!product.available && (
              <p className="mt-2 inline-flex rounded-full bg-coal px-3 py-1 text-sm font-bold text-cream">{microcopy.unavailable}</p>
            )}
          </header>

          {product.options && product.options.length > 0 && (
            <Group label={product.optionsLabel ?? "الحجم"} note={<span className="rounded-full bg-chili/10 px-2 py-0.5 text-[11px] text-chili">مطلوب</span>}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {product.options.map((o) => {
                  const selected = o.id === optionId;
                  return (
                    <label
                      key={o.id}
                      className={cn(
                        "relative flex cursor-pointer flex-col rounded-2xl border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-leaf-bright",
                        selected ? "border-chili bg-chili/5" : "border-coal/10 hover:border-coal/25",
                        o.available === false && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <input
                        type="radio"
                        name={`opt-${product.id}`}
                        checked={selected}
                        disabled={o.available === false}
                        onChange={() => setOptionId(o.id)}
                        className="sr-only"
                      />
                      <span className="font-bold">{o.name}</span>
                      <span className={cn("text-sm", selected ? "text-chili" : "text-smoke")}>{formatPrice(o.price)}</span>
                      {selected && <CheckIcon size={16} strokeWidth={3} className="absolute top-3 left-3 text-chili" />}
                    </label>
                  );
                })}
              </div>
            </Group>
          )}

          {product.choices && product.choices.length > 0 && (
            <Group label={product.choicesLabel ?? "على مزاجك"} note={<span className="text-[13px] font-bold text-leaf">ببلاش</span>}>
              <div className="flex flex-wrap gap-2">
                {product.choices.map((c) => (
                  <Chip key={c.id} on={choiceIds.includes(c.id)} onToggle={() => toggle(setChoiceIds)(c.id)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </Group>
          )}

          {product.extras && product.extras.length > 0 && (
            <Group label="زوّد براحتك" note={<span className="text-[12px] text-smoke">اختياري</span>}>
              {product.extras.every((e) => e.image) ? (
                <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-6">
                  {product.extras.map((e) => (
                    <ExtraDish key={e.id} extra={e} on={extraIds.includes(e.id)} onToggle={() => toggle(setExtraIds)(e.id)} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {product.extras.map((e) => (
                    <Chip key={e.id} on={extraIds.includes(e.id)} onToggle={() => toggle(setExtraIds)(e.id)} disabled={e.available === false}>
                      {e.name}
                      <span className="text-[12px] opacity-75">{e.price === null ? "" : `+ ${formatPrice(e.price)}`}</span>
                    </Chip>
                  ))}
                </div>
              )}
            </Group>
          )}
        </div>
      </div>

      <footer className="pb-safe flex items-center gap-3 border-t-2 border-dashed border-coal/15 bg-cream px-5 pt-3 md:px-7 md:pb-5">
        <QuantityStepper value={qty} onChange={setQty} label={product.name} />
        <Button size="lg" className="flex-1 px-6" onClick={submit} disabled={!canOrder}>
          <span className="flex-1 text-start">{product.available ? cta.add : microcopy.unavailable}</span>
          {unit !== null && <span className="tabular-nums">{formatPrice(unit * qty)}</span>}
        </Button>
      </footer>
    </>
  );
}

function Group({ label, note, children }: { label: string; note?: ReactNode; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 flex w-full items-center justify-between text-[15px] font-bold">
        {label}
        {note}
      </legend>
      {children}
    </fieldset>
  );
}

/** An add-on as the real thing (bowl / bottle photo), not a checkbox. Tap to reach for it. */
function ExtraDish({ extra, on, onToggle }: { extra: Extra; on: boolean; onToggle: () => void }) {
  const img = extra.image!;
  const bottle = img.height > img.width * 1.5;
  return (
    <label
      className={cn(
        "group flex cursor-pointer flex-col items-center text-center has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-leaf-bright",
        extra.available === false && "cursor-not-allowed opacity-40",
      )}
    >
      <input type="checkbox" className="sr-only" checked={on} disabled={extra.available === false} onChange={onToggle} />
      <span
        className={cn(
          "relative flex h-[4.5rem] items-end justify-center transition-transform duration-300 ease-snap group-active:scale-90",
          on ? "-translate-y-1 -rotate-6" : "group-hover:-rotate-3",
        )}
      >
        <span
          className={cn(
            "sticker relative block overflow-hidden bg-cream transition-shadow duration-300",
            bottle ? "h-full w-8 rounded-t-full rounded-b-lg" : "size-16 rounded-full",
            on && "outline-3 outline-leaf-bright",
          )}
        >
          <Image src={img.src} alt="" fill sizes="64px" className="object-cover" />
        </span>
        {on && (
          <span className="absolute -top-1 -left-1 grid size-6 animate-bump place-items-center rounded-full bg-leaf text-cream ring-2 ring-cream">
            <CheckIcon size={13} strokeWidth={3.4} />
          </span>
        )}
      </span>
      <span className="mt-1.5 text-[13px] leading-tight font-bold">{extra.name}</span>
      <span className={cn("text-[12px] tabular-nums", on ? "font-bold text-leaf" : "text-smoke")}>
        {extra.price === null ? "" : `+ ${formatPrice(extra.price)}`}
      </span>
    </label>
  );
}

function Chip({ on, onToggle, disabled, children }: { on: boolean; onToggle: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <label
      className={cn(
        "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 text-[15px] font-bold transition-[background-color,border-color,transform] duration-200 ease-chili active:scale-95 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-leaf-bright",
        on ? "-rotate-2 border-chili bg-chili text-cream" : "border-coal/15 hover:border-chili/50",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <input type="checkbox" className="sr-only" checked={on} disabled={disabled} onChange={onToggle} />
      {on && <CheckIcon size={15} strokeWidth={3} />}
      {children}
    </label>
  );
}
