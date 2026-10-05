# LAHALEBO — Creative Direction 2.0 (internal)

**شعبي بس معمول بمستوى عالمي.** Loud, hungry, Egyptian street food — not luxury, not a mascot site.

## The idea: the menu is a sign, the food swings

Egyptian street food is sold under hand-painted signs, in a hurry, by people who
swing plates onto the counter. The site borrows those two things and nothing else
(no table, no scroll story):

1. **Sign-painter type.** Words are the interface. They are huge, heavy, tone-on-tone,
   and they bleed off the edge like a shop sign that doesn't fit its wall.
2. **The swing.** Food never slides in a straight line. It rotates in around a pivot
   far off-screen (arc → rotation → one small overshoot → settle), like a plate
   swung onto the counter.

## Type system

| Role  | Font            | Use                                                    |
|-------|-----------------|--------------------------------------------------------|
| Shout | Badeen Display  | One giant word per moment. Never below ~4rem (it smudges). No digits (they read as Latin shapes). |
| Voice | Marhey          | Product names, the brand talking (مش عارف / إحنا عارفين) |
| UI    | Readex Pro      | Prices, buttons, forms, everything you must read fast  |

`font-synthesis: none` — Badeen only exists at one weight; it must never be faux-bolded.

## Colour hierarchy

- **Orange** — the stage. Where the koshary lives.
- **Red** — action. Every order button, every price.
- **Green** — confirmation. "It's in your order" (selected condiments, counts, toasts).
- **Cream** — paper and the die-cut sticker border taken from the logo.
- **Coal** — text.
- Heat: a section's colour changes like temperature (orange → red → cream for sweet → green for cold drinks), never as a hard cut.

The **die-cut sticker** (cream border + slight tilt, like the logo) is the one graphic device:
ingredient medallions, condiments, price tags and badges are all stickers.

## Motion laws

| Layer      | Motion                                         | Budget          |
|------------|------------------------------------------------|-----------------|
| Hero       | Koshary swings in on an arc, ingredients follow on their own arcs, the answer stamps | ~1.2s, once |
| Menu       | Food swaps by swinging out / swinging in; heat colour shifts | 500–700ms |
| Hero → menu | The chili storm, scroll-linked | follows the scroll |
| Sweet → cold | The dessert page slides sideways off, the drinks page slides in | follows the scroll |
| Condiments | Bottles tilt to pour, bowls scoop; count snaps  | ~600ms per tap |
| Pepper     | One eye: look → wink. On load, and once more on the first condiment | 1.5s, twice max |
| Cart       | Item flies on an arc, cart bumps                | 600ms           |
| Everything else | Still. Masked reveals once, then nothing   | —               |

Savory lands heavy (small overshoot). Sweet lands light (softer spring).
Only transform / opacity / clip-path are animated. Two pinned moments (the chili storm, the sweet → cold slide), no WebGL, no video.

## Page order

1. **Hero — the arrival.** "مش عارف تاكل إيه؟" … a tilted white frame swings in (it holds the hero photo, set in `config/site.ts → heroImage`; empty until supplied) … "إحنا عارفين."
2. **The chili storm (hero → menu).** Pinned: the room heats up, rows of chilies sweep across, «زوّد شطة.» in the middle, then it clears to the menu's orange.
3. **نفسك في إيه؟** — the full menu. Categories on the side; the chosen category's dish names in a row on top (the one on show is lit up); one big dish at a time underneath — swipe on a phone, arrows on a laptop.
4. **زوّد براحتك** — the condiment counter. Plain coloured circles until the real photos arrive; tap to add.
5. **طب نحلّيها؟ → حاجة ساقعة** — two full-screen pages that slide sideways (the next page comes in from the left) as you scroll.
6. **Footer** — the hotline, as big as the hero's question.

Plus, everywhere: **the wink** (load + first condiment only) and **طب نحلّيها؟** as a small ticket after the first savory add — never a modal.

## Rules

- Real Lahalebo photography only. Dishes without a photo get a typographic poster, never a borrowed picture.
- All products, prices and pairings come from `src/data`. No copy invents a dish.
- Ordering is always one tap away: sticky cart, price on every item, + on every item.
