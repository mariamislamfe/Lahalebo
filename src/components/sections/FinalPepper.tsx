"use client";

import { siteConfig } from "@/config/site";
import { cta } from "@/content/copy";
import { formatPhone } from "@/lib/format";
import { WinkingLogo } from "@/components/brand/WinkingLogo";
import { ArrowForwardIcon, PhoneIcon } from "@/components/ui/Icons";
import { OrderLink } from "@/components/ui/OrderLink";

/**
 * FINAL — the pepper as a character: its eye follows you around the section.
 * (The wink itself is saved for page load and a placed order.)
 */
export function FinalPepper() {
  const { hotline } = siteConfig.contact;
  return (
    <section aria-labelledby="final-title" className="relative overflow-hidden bg-orange py-20 text-cream md:py-28">
      <div aria-hidden="true" className="heat-light absolute top-1/2 left-1/2 size-[110vw] -translate-x-1/2 -translate-y-1/2 opacity-60 md:size-[70vw]" />
      <div className="container-site relative flex flex-col items-center text-center">
        <WinkingLogo track play={false} alive={false} className="w-[min(78vw,26rem)]" sizes="420px" />
        <h2 id="final-title" className="font-display mt-10 text-display font-black">
          لسه بتفكر؟
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <OrderLink className="group inline-flex h-15 items-center gap-3 rounded-full bg-cream ps-7 pe-2 text-xl font-bold text-chili shadow-cta transition-transform duration-200 ease-snap active:scale-95">
            {cta.order}
            <span className="grid size-11 place-items-center rounded-full bg-chili text-cream transition-transform duration-200 ease-snap group-hover:-translate-x-1">
              <ArrowForwardIcon strokeWidth={2.6} />
            </span>
          </OrderLink>
          <a href={`tel:${hotline}`} className="inline-flex h-15 items-center gap-2 rounded-full border-2 border-cream/80 px-6 text-cream hover:bg-cream hover:text-chili">
            <PhoneIcon />
            <span className="font-display text-2xl font-black">{formatPhone(hotline)}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
