import Image from "next/image";
import type { CSSProperties } from "react";
import type { Category, ProductImage } from "@/types/menu";
import { cta } from "@/content/copy";
import { ArrowForwardIcon } from "@/components/ui/Icons";
import { OrderLink } from "@/components/ui/OrderLink";
import { PriceFlag } from "@/components/ui/PriceFlag";

/**
 * HERO — THE KOSHARY ARRIVAL. One take, ~1.3s, pure CSS (starts at first paint):
 *   0.00  «مش عارف / تاكل إيه؟» rises out of its cut line
 *   0.12  the tilted white frame (with the hero photo) swings in on an arc from
 *         off-screen, overshoots by a hair and settles (see .swing-arm in globals.css)
 *   1.00  the answer gets stamped: «إحنا عارفين.»
 *   1.10  steam, CTAs, cravings
 * Then the hero is still. Nothing loops but a little steam (full motion only).
 */

const v = (vars: Record<string, string | number>) => vars as CSSProperties;

const STEAM = [
  { src: "/fx/steam-column-2.webp", l: "30%", d: "1.15s", dur: "5.8s", drift: "10%" },
  { src: "/fx/steam-puff-0.webp", l: "48%", d: "2.6s", dur: "6.6s", drift: "-8%" },
];

/** `plate` = the hero photo (config/site.ts → heroImage); null shows the empty frame. */
export function Hero({ plate, fromPrice, cravings }: { plate: ProductImage | null; fromPrice: number | null; cravings: Category[] }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      data-hero=""
      suppressHydrationWarning
      className="relative isolate flex min-h-[calc(100svh-var(--nav-h))] flex-col overflow-x-clip bg-orange text-cream lg:min-h-[max(40rem,calc(100svh-var(--nav-h)))]"
    >
      {/* heat core, where the plate lands */}
      <div aria-hidden="true" className="heat-light absolute top-[-14%] left-[-30%] -z-10 size-[130vw] lg:top-[-6%] lg:left-[-8%] lg:size-[64vw]" />

      {/* ---------- THE FRAME: a tilted white square that holds the hero photo ---------- */}
      <div className="relative h-[84vw] max-h-[30rem] shrink-0 lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:max-h-none lg:w-[50%]">
        <div className="absolute top-[7%] left-1/2 aspect-square w-[74%] max-w-[26rem] -translate-x-1/2 lg:top-1/2 lg:left-[48%] lg:w-[min(72%,32rem)] lg:max-w-none lg:-translate-y-1/2">
          {/* contact shadow */}
          <div
            aria-hidden="true"
            className="shadow-land absolute inset-x-[8%] bottom-[-7%] h-[16%] rounded-[50%] bg-chili-ink/40 blur-2xl"
            style={v({ "--d": "0.5s" })}
          />

          <div className="swing-arm absolute inset-0" style={v({ "--swing": "-32deg", "--pivot": "50% 250%", "--d": "0.12s", "--dur": "0.95s" })}>
            <div className="swing-grow absolute inset-0" style={v({ "--d": "0.12s", "--from-scale": "0.8" })}>
              <div className="absolute inset-0 -rotate-6 rounded-[2rem] bg-white p-[5%] shadow-[0_30px_50px_-18px_rgb(92_10_12/0.6)]">
                {plate && (
                  <div className="relative size-full overflow-hidden rounded-[1.4rem]">
                    <Image
                      src={plate.src}
                      alt={plate.alt}
                      fill
                      preload
                      data-plate=""
                      sizes="(min-width: 1024px) 32rem, 74vw"
                      className={plate.cutout ? "object-contain" : "object-cover"}
                      style={plate.focus ? { objectPosition: plate.focus } : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* steam: one breath as it lands, then a slow idle */}
          {plate && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-[10%] top-[-30%] h-[60%]">
              {STEAM.map((s) => (
                <span
                  key={s.src}
                  className="steam absolute bottom-0 aspect-square w-[46%] bg-contain bg-center bg-no-repeat"
                  style={v({ left: s.l, backgroundImage: `url(${s.src})`, "--d": s.d, "--dur": s.dur, "--drift": s.drift })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- THE QUESTION ---------- */}
      <div className="container-site relative z-10 mt-3 flex flex-1 flex-col pb-6 sm:mt-0 lg:mt-0 lg:justify-center lg:py-12">
        <div className="lg:w-[48%]">
          <h1 id="hero-title" className="leading-none">
            <span className="block overflow-hidden pt-1 pb-2">
              <span className="rise font-display text-[clamp(2.1rem,9vw,4.6rem)] font-bold text-chili-ink" style={v({ "--d": "0s" })}>
                مش عارف
              </span>
            </span>
            <span className="-mt-3 block overflow-hidden pb-[0.18em] lg:-mt-5">
              <span
                className="rise shout-sign text-[clamp(3.5rem,16vw,7.4rem)] leading-[1.3] whitespace-nowrap"
                style={v({ "--d": "0.1s", "--tilt": "7deg" })}
              >
                تاكل إيه؟
              </span>
            </span>
          </h1>

          <p
            className="stamp sticker font-display -mt-1 inline-block rounded-2xl bg-cream px-5 py-1.5 text-[clamp(1.7rem,6.5vw,2.6rem)] font-bold text-chili lg:-mt-3"
            style={v({ "--d": "1s", "--rot": "-4deg" })}
          >
            إحنا عارفين.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-8">
            <span className="pop flex-1 sm:flex-none" style={v({ "--d": "1.1s" })}>
              <OrderLink className="group inline-flex h-14 w-full items-center justify-between gap-3 rounded-full bg-cream ps-6 pe-2 text-lg font-bold whitespace-nowrap text-chili sm:justify-center shadow-cta transition-transform duration-200 ease-snap active:scale-95 sm:w-auto lg:h-15 lg:text-xl">
                {cta.order}
                <span className="grid size-10 place-items-center rounded-full bg-chili text-cream transition-transform duration-200 ease-snap group-hover:-translate-x-1">
                  <ArrowForwardIcon size={20} strokeWidth={2.6} />
                </span>
              </OrderLink>
            </span>
            <span className="pop sm:ms-2" style={v({ "--d": "1.2s" })}>
              <PriceFlag value={fromPrice} from size="lg" tone="cream" />
            </span>
          </div>

          {/* the answer to "what do you want?": every craving we can fix */}
          <nav aria-label="نفسك في إيه؟" className="pop mt-7 lg:mt-9" style={v({ "--d": "1.34s" })}>
            <p className="mb-2 text-sm font-bold text-chili-ink">ولا نفسك في…</p>
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {cravings.map((c, i) => (
                <li key={c.id} className="shrink-0">
                  <OrderLink
                    categoryId={c.id}
                    className="inline-flex h-10 items-center rounded-full bg-chili-deep/35 px-4 text-[15px] font-bold whitespace-nowrap text-cream ring-1 ring-cream/25 transition-[background-color,transform] duration-200 ease-snap hover:-rotate-2 hover:bg-cream hover:text-chili"
                    style={{ transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}
                  >
                    {c.craving}
                  </OrderLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* The arrival waits (paused) until the plate has decoded, so it never plays
          to an empty stage on a slow line. Runs before hydration; 2.5s safety net. */}
      <script dangerouslySetInnerHTML={{ __html: GATE }} />
    </section>
  );
}

const GATE = `(function(){var s=document.currentScript.parentNode,i=s.querySelector("img[data-plate]"),d=0;function go(){if(d)return;d=1;s.setAttribute("data-ready","")}if(!i||(i.complete&&i.naturalWidth))return go();i.addEventListener("load",go);i.addEventListener("error",go);setTimeout(go,2500)})()`;
