import { useEffect } from "react";

/**
 * Close the website itself (tab/webview) from a detail page instead of
 * navigating back within the app.
 *
 * `window.close()` works when the page was opened by script (new tab / webview).
 * If the browser blocks it (tab opened directly by the user), we fall back to
 * navigating to a blank page so the app is still "closed".
 */
export function closeDetailPage() {
  if (typeof window === "undefined") return;

  window.close();

  // If the browser refused to close the tab, blank the page as a fallback.
  window.setTimeout(() => {
    if (!window.closed) {
      window.location.href = "about:blank";
    }
  }, 100);
}

/**
 * Treat browser/device back as close for pages that are opened as standalone
 * detail views. Skip when the page was opened from another in-app page
 * (e.g. bill → order), so normal history back works.
 */
export function useCloseDetailPageOnBack(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    window.history.pushState({ closeDetailPageGuard: true }, "", window.location.href);

    const handlePopState = () => {
      closeDetailPage();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled]);
}

