/* ============================================================================
   Scroll lock helper — shared by the AppShell (drawers, palette, mobile menu)
   and by Dialog/modals on app pages.

   Why: two components used to write `document.body.style.overflow` directly.
   Whichever unmounted first cleared the lock, which left either a page that
   could scroll behind an open modal, or — worse — a page left permanently
   frozen (`overflow: hidden`) with no visible overlay: the classic "stuck
   dashboard, I can't see or scroll the page" bug.

   A reference counter fixes both directions, and `clearStaleScrollLock()`
   is a self-healing escape hatch: if the DOM has no open overlay at all, any
   leftover lock is dropped.
   ========================================================================== */

const OVERLAY_SELECTOR =
  ".gm-modal-overlay, .gm-palette-overlay, .gm-drawer.is-visible, .gm-app-side.is-open, .gm-search.is-visible";

let locks = 0;

function apply() {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "hidden";
  document.body.dataset.gmScrollLock = "1";
}

function release() {
  if (typeof document === "undefined") return;
  delete document.body.dataset.gmScrollLock;
  document.body.style.removeProperty("overflow");
}

/** Lock page scrolling (stacks safely with other locks). */
export function lockScroll() {
  locks += 1;
  apply();
}

/** Release one lock; only unlocks the page once every lock is released. */
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) release();
}

/**
 * Self-healing reset — call on mount / route change.
 * If nothing overlay-ish is actually open in the DOM, drop every lock.
 * This guarantees a dashboard page can never be left frozen by a stale
 * drawer, modal or dropdown.
 */
export function clearStaleScrollLock() {
  if (typeof document === "undefined") return;
  if (document.querySelector(OVERLAY_SELECTOR)) return;
  locks = 0;
  release();
}
