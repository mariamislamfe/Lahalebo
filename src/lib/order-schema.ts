import { z } from "zod";
import { siteConfig } from "@/config/site";

/** Converts Arabic-Indic digits so "٠١٠..." and "010..." validate the same way. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export const EGYPT_MOBILE = /^01[0125]\d{8}$/;

const phone = z
  .string()
  .transform((v) => normalizeDigits(v).replace(/[\s-]/g, "").replace(/^\+?20/, "0"))
  .refine((v) => EGYPT_MOBILE.test(v), { message: "رقم الموبايل لازم يكون ١١ رقم ويبدأ بـ 01" });

export const orderItemSchema = z.object({
  productId: z.string().min(1).max(64),
  optionId: z.string().max(64).optional(),
  extraIds: z.array(z.string().max(64)).max(20),
  choiceIds: z.array(z.string().max(64)).max(20),
  qty: z.number().int().min(1).max(50),
});

export const orderRequestSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2, "اكتب اسمك").max(80),
      phone,
    }),
    fulfillment: z.enum(siteConfig.ordering.fulfillment),
    address: z.string().trim().max(300).optional(),
    branchId: z.string().max(64).optional(),
    notes: z.string().trim().max(500).optional(),
    payment: z.enum(siteConfig.ordering.payment),
    items: z.array(orderItemSchema).min(1, "السلة فاضية").max(60),
  })
  .superRefine((order, ctx) => {
    if (order.fulfillment === "delivery" && (!order.address || order.address.length < 8)) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "محتاجين العنوان بالتفصيل عشان الأكل يوصل",
      });
    }
  });

export type OrderRequest = z.input<typeof orderRequestSchema>;
export type ValidOrder = z.output<typeof orderRequestSchema>;

export interface OrderConfirmation {
  orderId: string;
  createdAt: string;
  /** Sum of priced lines. */
  subtotal: number;
  /** False when some items/fees have no price yet — total is confirmed by phone. */
  priceComplete: boolean;
  deliveryFee: number | null;
  fulfillment: ValidOrder["fulfillment"];
  items: { name: string; details: string; qty: number; lineTotal: number | null }[];
}

export type OrderErrorCode = "invalid" | "unavailable" | "closed" | "server";

export interface OrderErrorBody {
  error: OrderErrorCode;
  message: string;
  fields?: Record<string, string>;
  productIds?: string[];
}
