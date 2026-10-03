"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { siteConfig, type Fulfillment } from "@/config/site";
import { cta } from "@/content/copy";
import { cn, formatPrice } from "@/lib/format";
import { orderRequestSchema, type OrderConfirmation, type OrderErrorBody, type OrderRequest } from "@/lib/order-schema";
import { submitOrder } from "@/lib/order-service";
import { useCart } from "@/store/cart-context";
import { useMenu } from "@/store/menu-context";
import { AlertIcon } from "@/components/ui/Icons";
import { CartSummary, orderTotal } from "./CartSummary";

const CUSTOMER_KEY = "lahalebo.customer.v1";

interface Saved {
  name: string;
  phone: string;
  address: string;
}

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    if (raw) return { name: "", phone: "", address: "", ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { name: "", phone: "", address: "" };
}

/**
 * One screen, few decisions: how you get it → who you are → where → confirm.
 * Validated with the same schema the server uses; the server still re-checks.
 */
export function CheckoutForm({ onSuccess }: { onSuccess: (order: OrderConfirmation) => void }) {
  const { lines, subtotal, removeProducts } = useCart();
  const { branches } = useMenu();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  // Sheets render client-only, so reading storage in the initializer is hydration-safe.
  const [form, setForm] = useState<Saved>(loadSaved);
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<OrderErrorBody | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => abort.current?.abort(), []);

  function update<K extends keyof Saved>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    const errKey = key === "address" ? "address" : `customer.${key}`;
    if (errors[errKey]) {
      setErrors((cur) => {
        const next = { ...cur };
        delete next[errKey];
        return next;
      });
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const request: OrderRequest = {
      customer: { name: form.name, phone: form.phone },
      fulfillment,
      address: fulfillment === "delivery" ? form.address : undefined,
      branchId: fulfillment === "pickup" ? branchId || undefined : undefined,
      notes: notes || undefined,
      payment: "cash",
      items: lines.map(({ productId, optionId, extraIds, choiceIds, qty }) => ({ productId, optionId, extraIds, choiceIds, qty })),
    };

    const parsed = orderRequestSchema.safeParse(request);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] ??= issue.message;
      setErrors(next);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    setSubmitting(true);
    abort.current = new AbortController();
    const result = await submitOrder(request, abort.current.signal);
    setSubmitting(false);

    if (result.ok) {
      try {
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(form));
      } catch {
        /* ignore */
      }
      onSuccess(result.order);
      return;
    }
    if (result.error.fields) setErrors(result.error.fields);
    setServerError(result.error);
  }

  const { total } = orderTotal(subtotal, fulfillment);
  // Pickup only makes sense once there are branches to pick up from.
  const modes = siteConfig.ordering.fulfillment.filter((f) => f === "delivery" || branches.length > 0);
  const unavailableIds = serverError?.error === "unavailable" ? serverError.productIds ?? [] : [];

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 md:px-6">
        {/* 1. How (only when there's a choice) */}
        {modes.length > 1 && (
        <fieldset>
          <legend className="mb-2.5 text-[15px] font-bold">هتستلم إزاي؟</legend>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-paper p-1 ring-1 ring-coal/8">
            {modes.map((f) => (
              <label
                key={f}
                className={cn(
                  "flex h-11 cursor-pointer items-center justify-center rounded-full text-[15px] font-bold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-leaf-bright",
                  fulfillment === f ? "bg-coal text-cream" : "text-smoke hover:text-coal",
                )}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={f}
                  checked={fulfillment === f}
                  onChange={() => setFulfillment(f)}
                  className="sr-only"
                />
                {f === "delivery" ? "توصيل للبيت" : "هستلم من الفرع"}
              </label>
            ))}
          </div>
        </fieldset>
        )}

        {/* 2. Who */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم" error={errors["customer.name"]}>
            {(props) => (
              <input
                {...props}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                autoComplete="name"
                enterKeyHint="next"
                placeholder="اسمك إيه؟"
              />
            )}
          </Field>
          <Field label="رقم الموبايل" error={errors["customer.phone"]} hint="عشان المندوب يوصلّك">
            {(props) => (
              <input
                {...props}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                dir="ltr"
                placeholder="01xxxxxxxxx"
                className={cn(props.className, "text-right placeholder:text-right")}
              />
            )}
          </Field>
        </div>

        {/* 3. Where */}
        {fulfillment === "delivery" ? (
          <Field label="العنوان" error={errors.address} hint="المنطقة، الشارع، رقم العمارة، الدور والشقة">
            {(props) => (
              <textarea
                {...props}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                autoComplete="street-address"
                rows={3}
                placeholder="مثلًا: مدينة نصر، شارع عباس العقاد، عمارة ١٢، الدور ٣"
                className={cn(props.className, "h-auto resize-none py-3 leading-relaxed")}
              />
            )}
          </Field>
        ) : (
          branches.length > 0 && (
            <Field label="الفرع">
              {(props) => (
                <select {...props} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.area ? ` — ${b.area}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )
        )}

        {showNotes ? (
          <Field label="ملاحظات للمطبخ" hint="اختياري">
            {(props) => (
              <textarea
                {...props}
                data-autofocus
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="من غير بصل، الشطة لوحدها…"
                className={cn(props.className, "h-auto resize-none py-3")}
              />
            )}
          </Field>
        ) : (
          <button type="button" onClick={() => setShowNotes(true)} className="text-[15px] font-bold text-leaf underline-offset-4 hover:underline">
            + عندك ملاحظة للمطبخ؟
          </button>
        )}

        {/* Payment — only what's supported */}
        <div className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 ring-1 ring-coal/8">
          <span className="text-[15px]">الدفع</span>
          <span className="font-bold">كاش عند الاستلام</span>
        </div>

        <CartSummary subtotal={subtotal} fulfillment={fulfillment} />

        {serverError && (
          <div role="alert" className="rounded-2xl bg-chili/8 p-4 text-[15px] text-chili-deep">
            <p className="flex items-start gap-2 font-bold">
              <AlertIcon size={18} className="mt-0.5 shrink-0" />
              {serverError.message}
            </p>
            {unavailableIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  removeProducts(unavailableIds);
                  setServerError(null);
                }}
                className="mt-3 h-10 rounded-full bg-chili px-4 text-sm font-bold text-cream"
              >
                شيل الأصناف دي وكمّل
              </button>
            )}
          </div>
        )}
      </div>

      <footer className="pb-safe border-t border-coal/8 bg-cream px-5 pt-3 md:px-6 md:pb-5">
        <button
          type="submit"
          disabled={submitting || lines.length === 0 || !siteConfig.ordering.open}
          className="flex h-14 w-full items-center justify-between rounded-full bg-chili px-6 text-[17px] font-bold text-cream shadow-cta transition-[background-color,transform] hover:bg-chili-deep active:scale-[0.98] disabled:opacity-60"
        >
          <span>{submitting ? "بنبعت الطلب…" : cta.confirm}</span>
          <span className="tabular-nums">{formatPrice(total)}</span>
        </button>
      </footer>
    </form>
  );
}

type ControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  className: string;
};

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-bold">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
        className: cn(
          "h-12 w-full rounded-2xl border-2 bg-white px-4 text-base outline-none transition-colors placeholder:text-smoke/60",
          error ? "border-chili" : "border-coal/10 focus:border-leaf",
        ),
      })}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-[13px] font-bold text-chili">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-smoke">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
