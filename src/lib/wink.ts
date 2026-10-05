/**
 * The pepper's eye is an Easter egg, so it has a budget:
 *   1. page load  — it looks at you and winks.
 *   2. the first time you add a condiment in «زوّد براحتك» — it approves.
 * That's it. Never again in the same visit.
 */
export const WINK_EVENT = "lahalebo:wink";
const ENCORE_KEY = "lahalebo.wink.encore";

/** Ask the navbar pepper for its one encore. No-op after the first call per visit. */
export function requestEncoreWink() {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(ENCORE_KEY)) return;
    sessionStorage.setItem(ENCORE_KEY, "1");
  } catch {
    /* storage blocked — the in-memory flag below still limits it */
  }
  if (encoreUsed) return;
  encoreUsed = true;
  window.dispatchEvent(new Event(WINK_EVENT));
}

let encoreUsed = false;
