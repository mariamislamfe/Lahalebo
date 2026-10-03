# لهاليبو كشري — Lahalebo

**From heat to order.** Arabic-first, mobile-first ordering site.
Next.js 16 (App Router) · TypeScript · Tailwind v4 · `motion` (scroll scenes, sheets) · `zod` (shared validation).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## The page

Small signature moments instead of one long scroll story:

| # | Moment | Component |
| --- | --- | --- |
| 1 | **Hero** — the koshary whooshes in (pure CSS, first paint) with «جعان؟ لهاليبو بيناديك.». Then it pins: the words split, the camera plunges into the bowl as the room turns red, a **chili storm** sweeps across and fills the screen («زوّد شطة.»), and clears to cream into the dishes. | `components/hero/Hero.tsx` |
| 2 | **The pepper winks** — a separate SVG eye over the untouched logo. Plays once on load, and once more on the order confirmation. | `components/brand/WinkingLogo.tsx` |
| 3 | **Signature** (before the tablet) — the plate with steam rising from the start + «لهاليبو» on fire, interlocked; its steam becomes the **steam wall** that clears onto the tablet. **Extras** (after the tablet) — «طب نحلّيها؟» + drinks list. | `components/dishes/Dishes.tsx` |
| 4 | **The tablet** — the only menu; switching category = a red sweep with the category name + sliding highlight + section drop-in; sections unfold; all ordering happens on its screen; at the list ends the wheel hands over to the page. | `components/portal/*` |
| 5 | **Cart** — dish flies in (~0.6s), cart jolts + glows, a thumbnail peeks out; «طب نحلّيها؟» inline. | `lib/fly-to-cart.ts`, `layout/Navbar.tsx`, `cart/*` |
| 6 | **Final** — the pepper's eye follows your cursor. | `sections/FinalPepper.tsx` |

Type: **Kufam** (display) + **IBM Plex Sans Arabic** (text). Smooth scrolling: **Lenis** (`components/SmoothScroll.tsx`; off when motion is off; tablet menu and sheets keep native scroll).
Motion modes (`lib/motion-pref.ts`): **full**; **calm** (default when the device asks for reduced motion — one-shot moments still play, loops stop); **off** (settled everything; footer switch).

## Content status

- **Temporary menu + prices** live in `src/data/menu.ts` (flagged TEMP). Replace there — every section updates.
- **Delivery fee** is temporary: `siteConfig.ordering.deliveryFee`.
- **Recommendations**: rules in `src/data/recommendations.ts`, plus optional `recommendations: [...]` per product.
- **Real brand content**: logo, the three photos, hotline 19138, Facebook, the koshary choices and campaign lines.
- Dishes without a photo render as a brand colour poster; add `image` to replace it.
- Branches section renders once `src/data/branches.ts` has entries.

## Architecture notes

- `lib/menu-service.ts` is the only data access point — swap for API/Prisma calls.
- `lib/pricing.ts` is shared by cart display and `/api/orders`; the server re-prices every line and ignores client totals. Unknown prices stay unknown end-to-end.
- `/api/orders` is a **mock** (validates, re-prices, returns an order id; nothing persisted). TODO(backend): persist, notify branch, rate-limit.
- Scroll scenes use `hooks/useProgress.ts` (pads keyframes for motion's native scroll-timeline acceleration). Motion is transform/opacity only.
- Steam = four pre-rendered noise textures in `/public/fx` (~25KB each), used only as scroll-scrubbed transitions.
- Dish surfaces (`surface-orange/red/leaf/cream`) and the chili price flag (`ui/PriceFlag.tsx`) are the brand's visual DNA.
