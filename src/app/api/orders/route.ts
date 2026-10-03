import { randomBytes } from "node:crypto";
import { siteConfig } from "@/config/site";
import { getMenu } from "@/lib/menu-service";
import { orderRequestSchema, type OrderConfirmation, type OrderErrorBody } from "@/lib/order-schema";
import { indexMenu, priceLine, sumLines, type PricedLine } from "@/lib/pricing";

/**
 * MOCK order endpoint.
 * Validates input and re-prices every line from the server's own menu —
 * client prices/totals are never trusted. Nothing is persisted yet.
 * TODO(backend): persist via NestJS/Prisma, notify the branch, rate-limit per IP/phone.
 */

function fail(status: number, body: OrderErrorBody) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  if (!siteConfig.ordering.open) {
    return fail(503, { error: "closed", message: "الطلبات مقفولة دلوقتي. نرجع قريب." });
  }

  const json = await request.json().catch(() => null);
  if (!json || typeof json !== "object") {
    return fail(400, { error: "invalid", message: "الطلب وصل ناقص. جرّب تاني." });
  }
  const parsed = orderRequestSchema.safeParse(json);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      fields[key] ??= issue.message;
    }
    return fail(422, { error: "invalid", message: "في بيانات ناقصة أو مش مظبوطة.", fields });
  }

  const order = parsed.data;
  const index = indexMenu(await getMenu());
  const priced: PricedLine[] = [];
  const unavailable: string[] = [];

  for (const item of order.items) {
    const result = priceLine(index, item);
    if (result.ok) priced.push(result.line);
    else unavailable.push(item.productId);
  }

  if (unavailable.length) {
    return fail(409, {
      error: "unavailable",
      message: "في أصناف في السلة مش متاحة دلوقتي. شيلها وكمّل.",
      productIds: unavailable,
    });
  }

  const { total: subtotal, complete } = sumLines(priced);
  const deliveryFee = order.fulfillment === "delivery" ? siteConfig.ordering.deliveryFee : 0;

  const confirmation: OrderConfirmation = {
    orderId: `LH-${randomBytes(3).toString("hex").toUpperCase()}`,
    createdAt: new Date().toISOString(),
    subtotal,
    priceComplete: complete && deliveryFee !== null,
    deliveryFee,
    fulfillment: order.fulfillment,
    items: priced.map((l) => ({
      name: l.product.name,
      details: [l.optionName, ...l.extraNames, ...l.choiceNames].filter(Boolean).join(" · "),
      qty: l.qty,
      lineTotal: l.lineTotal,
    })),
  };

  return Response.json(confirmation, { status: 201 });
}
