/**
 * The dish cutout flies from where you tapped into the visible cart target
 * ([data-cart-target]). Web Animations API, transform/opacity only;
 * skipped when motion is switched off.
 */
export function flyToCart(src: string | undefined, from: HTMLElement | null | undefined) {
  if (!src || !from || typeof window === "undefined") return;
  if (document.documentElement.dataset.motion === "off") return;

  const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find(
    (el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0,
  );
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 88;
  const sx = a.left + a.width / 2 - size / 2;
  const sy = a.top + a.height / 2 - size / 2;
  const dx = b.left + b.width / 2 - size / 2 - sx;
  const dy = b.top + b.height / 2 - size / 2 - sy;

  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  Object.assign(img.style, {
    position: "fixed",
    left: `${sx}px`,
    top: `${sy}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "contain",
    zIndex: "70",
    pointerEvents: "none",
    filter: "drop-shadow(0 10px 10px rgb(60 20 5 / 0.35))",
  });
  document.body.appendChild(img);

  // Arc: rise first, then drop into the cart.
  const lift = Math.min(-80, dy * 0.3 - 80);
  img
    .animate(
      [
        { transform: "translate(0,0) scale(0.6) rotate(0deg)", opacity: 0 },
        { transform: "translate(0,-18px) scale(1) rotate(-6deg)", opacity: 1, offset: 0.15 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.35 + lift}px) scale(0.8) rotate(-14deg)`, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.22) rotate(8deg)`, opacity: 0.9 },
      ],
      { duration: 620, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "forwards" },
    )
    .finished.finally(() => img.remove());
}
