/**
 * Every "order / menu" action on the page goes through here and lands the
 * visitor on the craving menu (#order), optionally on a category.
 */
import { scrollToElement } from "./smooth-scroll";

export const ORDER_ANCHOR = "order";
export const ORDER_EVENT = "lahalebo:order";

export interface OrderEventDetail {
  categoryId?: string;
}

export function openOrder(detail: OrderEventDetail = {}) {
  const anchor = document.getElementById(ORDER_ANCHOR);
  if (!anchor) return;
  const still = document.documentElement.dataset.motion === "off";
  scrollToElement(anchor, !still);
  window.dispatchEvent(new CustomEvent<OrderEventDetail>(ORDER_EVENT, { detail }));
}
