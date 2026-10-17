import { useEffect } from 'react';

/**
 * Keeps the CSS variable `--app-height` equal to the *actually visible*
 * viewport height, in px. `#root` uses it instead of relying on `100dvh` alone.
 *
 * Why: on Android (notably the installed PWA after a pull-to-refresh reload),
 * `100vh`/`100dvh` can resolve taller than the visible area — e.g. counting
 * the space behind the system bars — so the bottom of a full-height layout
 * (the game's "End Game" button) ends up partly off-screen. The visual
 * viewport reports what the user really sees, and is re-read whenever it
 * changes (resize, rotation, browser UI showing/hiding, back-forward cache).
 */
function update(): void {
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
}

/**
 * `routeKey` (the current pathname) re-measures on every screen change too —
 * a safety net in case a viewport change slipped by without a resize event,
 * so entering a game always starts from a fresh measurement.
 */
export function useAppHeight(routeKey: string): void {
  useEffect(() => {
    update();
  }, [routeKey]);

  useEffect(() => {
    // The visible height can settle a frame or two after load on mobile.
    const frameId = requestAnimationFrame(update);
    const timeoutId = window.setTimeout(update, 300);

    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.addEventListener('pageshow', update);
    window.visualViewport?.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('pageshow', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);
}
