/**
 * Go back one history entry. Use this for Back/Cancel instead of
 * router.push(parent) — push creates A→B→A loops between two screens.
 * Falls back to replace(href) when there is no history to pop.
 */
export function navigateBack(
  router: { back: () => void; replace: (href: string) => void },
  fallbackHref = "/"
): void {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
    return;
  }
  router.replace(fallbackHref);
}
