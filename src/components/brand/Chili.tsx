/**
 * The chili silhouette — the brand's recurring shape.
 * Used on the table, in empty states and as a closing accent. Kept as geometry here so every usage stays identical.
 */

export const CHILI_VIEWBOX = "0 0 400 560";

/** Body path in a 400×560 box (tip bottom-left, shoulders top). */
export const CHILI_BODY =
  "M104 168C140 118 276 106 332 150C388 194 380 300 336 382C292 462 196 522 66 548C52 551 46 537 58 529C150 468 172 400 152 320C138 262 72 214 104 168Z";

/** Calyx + stem, sits on the shoulders. */
export const CHILI_STEM_CAP =
  "M92 170C112 132 170 124 214 136C250 124 318 120 342 158C312 146 282 154 262 170C246 160 226 160 210 172C190 158 150 156 92 170Z";
export const CHILI_STEM = "M214 140C206 96 222 54 268 26";

export function ChiliMark({
  className,
  body = "var(--color-chili)",
  stem = "var(--color-leaf)",
}: {
  className?: string;
  body?: string;
  stem?: string;
}) {
  return (
    <svg viewBox={CHILI_VIEWBOX} className={className} aria-hidden="true" focusable="false">
      <path d={CHILI_BODY} fill={body} />
      <path d={CHILI_STEM} fill="none" stroke={stem} strokeWidth="22" strokeLinecap="round" />
      <path d={CHILI_STEM_CAP} fill={stem} />
    </svg>
  );
}
