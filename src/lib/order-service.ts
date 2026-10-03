import type { OrderConfirmation, OrderErrorBody, OrderRequest } from "@/lib/order-schema";

/** Client-side order gateway. Swap the endpoint when the real backend exists. */

export type SubmitResult =
  | { ok: true; order: OrderConfirmation }
  | { ok: false; error: OrderErrorBody };

export async function submitOrder(request: OrderRequest, signal?: AbortSignal): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch {
    return {
      ok: false,
      error: { error: "server", message: "النت فصل ولا إيه؟ اتأكد من الاتصال وجرّب تاني." },
    };
  }

  const body = await res.json().catch(() => null);
  if (res.ok && body) return { ok: true, order: body as OrderConfirmation };
  return {
    ok: false,
    error:
      (body as OrderErrorBody | null) ?? {
        error: "server",
        message: "حصلت مشكلة عندنا مش عندك. جرّب كمان شوية.",
      },
  };
}
