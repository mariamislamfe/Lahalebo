/**
 * Motion preference.
 *   full — everything.
 *   calm — one-shot moments (hero impact, wink, cart) and scroll-linked motion
 *          still play; continuous loops (idle steam, pointer-following eye) stop.
 *          Default when the OS asks for reduced motion — Windows "Animation
 *          effects: off" is common and would otherwise freeze the whole site.
 *   off  — still versions of every scene. Opt-in via the footer switch.
 * Stored on <html data-motion> (set before paint by the boot script).
 */
export type MotionMode = "full" | "calm" | "off";

export const MOTION_KEY = "lahalebo.motion";
export const MOTION_EVENT = "lahalebo:motion";

/** Runs in <head> before hydration: no flash, SSR markup stays valid. */
export const motionBootScript = `(function(){var d=document.documentElement;d.classList.add('js');var s=null;try{s=localStorage.getItem('${MOTION_KEY}')}catch(e){}var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.motion=(s==='full'||s==='calm'||s==='off')?s:(r?'calm':'full');})();`;

export function readMotionMode(): MotionMode {
  if (typeof document === "undefined") return "full";
  const m = document.documentElement.dataset.motion;
  return m === "calm" || m === "off" ? m : "full";
}

export function setMotionMode(mode: MotionMode) {
  document.documentElement.dataset.motion = mode;
  try {
    localStorage.setItem(MOTION_KEY, mode);
  } catch {
    /* private mode — still applies for this visit */
  }
  window.dispatchEvent(new Event(MOTION_EVENT));
}
